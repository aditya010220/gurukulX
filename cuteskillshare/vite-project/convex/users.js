import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Auth Helper ───────────────────────────────────────────────
async function getCurrentUser(ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) throw new Error("User not found");
  return user;
}

// ─── getOrCreate ───────────────────────────────────────────────
// Called on every login to sync Clerk user into Convex
export const getOrCreate = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    referredBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      // Update name/email if changed in Clerk
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
      });
      return existing._id;
    }

    // Create new user with defaults
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: args.name,
      email: args.email,
      skills: [],
      learningGoals: [],
      skillCoins: 100, // Welcome bonus
      currentStreak: 0,
      totalExchanges: 0,
      title: "",
      location: "",
      avatar: identity.pictureUrl || "",
      referredBy: args.referredBy,
    });

    // Insert welcome bonus transaction
    await ctx.db.insert("transactions", {
      userId,
      type: "earned",
      label: "Welcome Bonus",
      amount: 100,
      icon: "Gift",
      createdAt: Date.now(),
    });

    // If referredBy is set, let's credit the referrer!
    if (args.referredBy) {
      let referrer = null;
      try {
        const referrerId = ctx.db.normalizeId("users", args.referredBy);
        if (referrerId) {
          referrer = await ctx.db.get(referrerId);
        }
      } catch (e) {
        console.error("Invalid referrer ID", e);
      }

      if (referrer) {
        // Referral bonus: 50 SkillCoins
        const referralAmount = 50;
        await ctx.db.patch(referrer._id, {
          skillCoins: referrer.skillCoins + referralAmount,
        });

        // Insert referral reward transaction for referrer
        await ctx.db.insert("transactions", {
          userId: referrer._id,
          type: "earned",
          label: `Referral Reward: ${args.name}`,
          amount: referralAmount,
          icon: "UserPlus",
          createdAt: Date.now(),
        });
      }
    }

    // Auto-seed offerings if none exist
    const existingOfferings = await ctx.db.query("marketplaceOfferings").take(1);
    if (existingOfferings.length === 0) {
      const instructors = await ctx.db.query("users").collect();
      const instructorId = instructors[0]?._id || userId;
      
      const seedData = [
        {
          title: 'Advanced React Patterns',
          coverImage: 'https://images.unsplash.com/photo-1542546068979-b6affb46ea8f',
          description: 'Master advanced React patterns including compound components, render props, and custom hooks.',
          duration: '8 weeks',
          level: 'Advanced',
          price: 12,
          category: 'Web Development',
        },
        {
          title: 'UI/UX Design Fundamentals',
          coverImage: 'https://images.unsplash.com/photo-1675317120753-ce28b951e9e8',
          description: 'Learn the principles of user-centered design, from wireframing to prototyping.',
          duration: '6 weeks',
          level: 'Beginner',
          price: 8,
          category: 'Design',
        },
        {
          title: 'Python for Data Science',
          coverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1273044c1-1766319477622.png',
          description: 'Comprehensive introduction to Python for data analysis, covering pandas, NumPy, and visualization.',
          duration: '10 weeks',
          level: 'Intermediate',
          price: 15,
          category: 'Data Science',
        }
      ];

      for (const item of seedData) {
        await ctx.db.insert("marketplaceOfferings", {
          instructorId,
          title: item.title,
          description: item.description,
          coverImage: item.coverImage,
          duration: item.duration,
          level: item.level,
          category: item.category,
          price: item.price,
          rating: 4.8,
          studentsCount: 24,
          createdAt: Date.now(),
        });
      }
    }

    return userId;
  },
});

// ─── getCurrent ────────────────────────────────────────────────
// Get the currently authenticated user's full profile
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

// ─── getById ───────────────────────────────────────────────────
// View another user's public profile
export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// ─── updateProfile ─────────────────────────────────────────────
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    location: v.optional(v.string()),
    avatar: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    learningGoals: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const updates = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.title !== undefined) updates.title = args.title;
    if (args.location !== undefined) updates.location = args.location;
    if (args.avatar !== undefined) updates.avatar = args.avatar;
    if (args.skills !== undefined) updates.skills = args.skills;
    if (args.learningGoals !== undefined) updates.learningGoals = args.learningGoals;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(user._id, updates);
    }

    return user._id;
  },
});

// ─── search ────────────────────────────────────────────────────
// Global search for users by name (navbar search)
export const search = query({
  args: { searchQuery: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchQuery || args.searchQuery.length < 2) return [];

    const allUsers = await ctx.db.query("users").collect();
    const query = args.searchQuery.toLowerCase();

    return allUsers
      .filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.skills.some((s) => s.toLowerCase().includes(query)) ||
          u.title.toLowerCase().includes(query)
      )
      .slice(0, 10)
      .map((u) => ({
        _id: u._id,
        name: u.name,
        title: u.title,
        avatar: u.avatar,
        skills: u.skills,
      }));
  },
});

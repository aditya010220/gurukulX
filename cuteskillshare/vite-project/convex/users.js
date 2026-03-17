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

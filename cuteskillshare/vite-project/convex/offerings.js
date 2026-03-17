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

// ─── list ──────────────────────────────────────────────────────
// Marketplace listings — supports search, category filter, sort
export const list = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    sortBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let offerings;

    // Use category index if filtering
    if (args.category && args.category !== "all") {
      offerings = await ctx.db
        .query("marketplaceOfferings")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .collect();
    } else {
      offerings = await ctx.db
        .query("marketplaceOfferings")
        .withIndex("by_created")
        .order("desc")
        .collect();
    }

    // Search filter
    if (args.search && args.search.trim()) {
      const query = args.search.toLowerCase();
      offerings = offerings.filter(
        (o) =>
          o.title.toLowerCase().includes(query) ||
          o.description.toLowerCase().includes(query) ||
          o.category.toLowerCase().includes(query)
      );
    }

    // Sort
    if (args.sortBy === "popular") {
      offerings.sort((a, b) => b.studentsCount - a.studentsCount);
    } else if (args.sortBy === "price-low") {
      offerings.sort((a, b) => a.price - b.price);
    } else if (args.sortBy === "price-high") {
      offerings.sort((a, b) => b.price - a.price);
    } else if (args.sortBy === "rating") {
      offerings.sort((a, b) => b.rating - a.rating);
    }

    // Enrich with instructor data
    const enriched = await Promise.all(
      offerings.map(async (o) => {
        const instructor = await ctx.db.get(o.instructorId);
        return {
          ...o,
          instructorName: instructor?.name || "Unknown",
          instructorAvatar: instructor?.avatar || "",
        };
      })
    );

    return enriched;
  },
});

// ─── getById ───────────────────────────────────────────────────
export const getById = query({
  args: { offeringId: v.id("marketplaceOfferings") },
  handler: async (ctx, args) => {
    const offering = await ctx.db.get(args.offeringId);
    if (!offering) return null;

    const instructor = await ctx.db.get(offering.instructorId);
    return {
      ...offering,
      instructorName: instructor?.name || "Unknown",
      instructorAvatar: instructor?.avatar || "",
    };
  },
});

// ─── getFeatured ───────────────────────────────────────────────
// Top 4 offerings for dashboard preview (sorted by rating)
export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    const offerings = await ctx.db
      .query("marketplaceOfferings")
      .withIndex("by_created")
      .order("desc")
      .collect();

    // Sort by rating desc, take top 4
    const sorted = offerings.sort((a, b) => b.rating - a.rating).slice(0, 4);

    const enriched = await Promise.all(
      sorted.map(async (o) => {
        const instructor = await ctx.db.get(o.instructorId);
        return {
          ...o,
          instructorName: instructor?.name || "Unknown",
          instructorAvatar: instructor?.avatar || "",
        };
      })
    );

    return enriched;
  },
});

// ─── create ────────────────────────────────────────────────────
// Instructor creates a new offering
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    coverImage: v.string(),
    duration: v.string(),
    level: v.string(),
    category: v.string(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const offeringId = await ctx.db.insert("marketplaceOfferings", {
      instructorId: user._id,
      title: args.title,
      description: args.description,
      coverImage: args.coverImage,
      duration: args.duration,
      level: args.level,
      category: args.category,
      price: args.price,
      rating: 0,
      studentsCount: 0,
      createdAt: Date.now(),
    });

    return offeringId;
  },
});

// ─── enroll ────────────────────────────────────────────────────
// Atomic: check balance → deduct coins → create enrollment → update count → log transaction
export const enroll = mutation({
  args: { offeringId: v.id("marketplaceOfferings") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const offering = await ctx.db.get(args.offeringId);

    if (!offering) throw new Error("Offering not found");

    // Check already enrolled
    const existingEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const alreadyEnrolled = existingEnrollment.some(
      (e) => e.offeringId.toString() === args.offeringId.toString()
    );

    if (alreadyEnrolled) throw new Error("Already enrolled");

    // Check balance
    if (user.skillCoins < offering.price) {
      throw new Error("Insufficient SkillCoins");
    }

    // Deduct coins from user
    await ctx.db.patch(user._id, {
      skillCoins: user.skillCoins - offering.price,
    });

    // Log transaction
    await ctx.db.insert("transactions", {
      userId: user._id,
      type: "spent",
      label: `Enrolled: ${offering.title}`,
      amount: offering.price,
      icon: "BookOpen",
      createdAt: Date.now(),
    });

    // Create enrollment
    await ctx.db.insert("enrollments", {
      userId: user._id,
      offeringId: args.offeringId,
      enrolledAt: Date.now(),
    });

    // Increment student count
    await ctx.db.patch(args.offeringId, {
      studentsCount: offering.studentsCount + 1,
    });

    // Credit instructor
    const instructor = await ctx.db.get(offering.instructorId);
    if (instructor) {
      await ctx.db.patch(offering.instructorId, {
        skillCoins: instructor.skillCoins + offering.price,
      });
      await ctx.db.insert("transactions", {
        userId: offering.instructorId,
        type: "earned",
        label: `Student enrolled: ${offering.title}`,
        amount: offering.price,
        icon: "GraduationCap",
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

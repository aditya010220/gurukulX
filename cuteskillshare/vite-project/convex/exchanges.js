import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Auth Helper ───────────────────────────────────────────────
async function getCurrentUser(ctx, { throwIfMissing = true } = {}) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    if (throwIfMissing) throw new Error("Unauthorized");
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    if (throwIfMissing) throw new Error("User not found");
    return null;
  }
  return user;
}

// ─── Helper: enrich exchange with partner data ─────────────────
async function enrichExchange(ctx, exchange, currentUserId) {
  const isOwner = exchange.userId.toString() === currentUserId.toString();
  const partnerId = isOwner ? exchange.partnerId : exchange.userId;
  const partner = await ctx.db.get(partnerId);

  return {
    ...exchange,
    partnerName: partner?.name || "Unknown",
    partnerAvatar: partner?.avatar || "",
    partnerTitle: partner?.title || "",
  };
}

// ─── getActive ─────────────────────────────────────────────────
// Active exchanges for dashboard
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx, { throwIfMissing: false });
    if (!user) return [];

    // Get exchanges where user is either owner or partner, status active
    const asUser = await ctx.db
      .query("exchanges")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const asPartner = await ctx.db
      .query("exchanges")
      .withIndex("by_partner", (q) => q.eq("partnerId", user._id))
      .collect();

    const allExchanges = [...asUser, ...asPartner].filter(
      (e) => e.status === "active"
    );

    // Enrich with partner data
    const enriched = await Promise.all(
      allExchanges.map((e) => enrichExchange(ctx, e, user._id))
    );

    return enriched;
  },
});

// ─── listByUser ────────────────────────────────────────────────
// All exchanges for my-swaps page (active, completed, pending)
export const listByUser = query({
  args: { statusFilter: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, { throwIfMissing: false });
    if (!user) return [];

    const asUser = await ctx.db
      .query("exchanges")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const asPartner = await ctx.db
      .query("exchanges")
      .withIndex("by_partner", (q) => q.eq("partnerId", user._id))
      .collect();

    let allExchanges = [...asUser, ...asPartner];

    // Filter by status if provided
    if (args.statusFilter && args.statusFilter !== "all") {
      allExchanges = allExchanges.filter(
        (e) => e.status === args.statusFilter
      );
    }

    const enriched = await Promise.all(
      allExchanges.map((e) => enrichExchange(ctx, e, user._id))
    );

    return enriched;
  },
});

// ─── getStats ──────────────────────────────────────────────────
// Counts of active, completed, pending exchanges
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx, { throwIfMissing: false });
    if (!user) {
      return { active: 0, completed: 0, pending: 0, total: 0 };
    }

    const asUser = await ctx.db
      .query("exchanges")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const asPartner = await ctx.db
      .query("exchanges")
      .withIndex("by_partner", (q) => q.eq("partnerId", user._id))
      .collect();

    const all = [...asUser, ...asPartner];

    return {
      active: all.filter((e) => e.status === "active").length,
      completed: all.filter((e) => e.status === "completed").length,
      pending: all.filter((e) => e.status === "pending").length,
      total: all.length,
    };
  },
});

// ─── create ────────────────────────────────────────────────────
// Create a new exchange between two users
export const create = mutation({
  args: {
    partnerId: v.id("users"),
    teachingSkill: v.string(),
    learningSkill: v.string(),
    totalSessions: v.number(),
    nextSession: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (args.partnerId === user._id) {
      throw new Error("Cannot create exchange with yourself");
    }

    // Verify partner exists
    const partner = await ctx.db.get(args.partnerId);
    if (!partner) throw new Error("Partner not found");

    const exchangeId = await ctx.db.insert("exchanges", {
      userId: user._id,
      partnerId: args.partnerId,
      teachingSkill: args.teachingSkill,
      learningSkill: args.learningSkill,
      status: "pending",
      completedSessions: 0,
      totalSessions: args.totalSessions,
      nextSession: args.nextSession || "",
    });

    return exchangeId;
  },
});

// ─── reschedule ────────────────────────────────────────────────
export const reschedule = mutation({
  args: {
    exchangeId: v.id("exchanges"),
    nextSession: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const exchange = await ctx.db.get(args.exchangeId);

    if (!exchange) throw new Error("Exchange not found");

    // Verify ownership
    if (
      exchange.userId.toString() !== user._id.toString() &&
      exchange.partnerId.toString() !== user._id.toString()
    ) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.exchangeId, {
      nextSession: args.nextSession,
    });
  },
});

// ─── completeSession ───────────────────────────────────────────
export const completeSession = mutation({
  args: { exchangeId: v.id("exchanges") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const exchange = await ctx.db.get(args.exchangeId);

    if (!exchange) throw new Error("Exchange not found");

    // Verify ownership
    if (
      exchange.userId.toString() !== user._id.toString() &&
      exchange.partnerId.toString() !== user._id.toString()
    ) {
      throw new Error("Not authorized");
    }

    const newCompleted = exchange.completedSessions + 1;
    const updates = { completedSessions: newCompleted };

    // Auto-complete if all sessions done
    if (newCompleted >= exchange.totalSessions) {
      updates.status = "completed";

      // Award coins to both users
      const owner = await ctx.db.get(exchange.userId);
      const partner = await ctx.db.get(exchange.partnerId);

      if (owner) {
        await ctx.db.patch(exchange.userId, {
          skillCoins: owner.skillCoins + 50,
          totalExchanges: owner.totalExchanges + 1,
        });
        await ctx.db.insert("transactions", {
          userId: exchange.userId,
          type: "earned",
          label: `Completed: ${exchange.teachingSkill}`,
          amount: 50,
          icon: "Award",
          createdAt: Date.now(),
        });
      }

      if (partner) {
        await ctx.db.patch(exchange.partnerId, {
          skillCoins: partner.skillCoins + 50,
          totalExchanges: partner.totalExchanges + 1,
        });
        await ctx.db.insert("transactions", {
          userId: exchange.partnerId,
          type: "earned",
          label: `Completed: ${exchange.learningSkill}`,
          amount: 50,
          icon: "Award",
          createdAt: Date.now(),
        });
      }
    }

    await ctx.db.patch(args.exchangeId, updates);
    return newCompleted;
  },
});

// ─── updateStatus ──────────────────────────────────────────────
export const updateStatus = mutation({
  args: {
    exchangeId: v.id("exchanges"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const exchange = await ctx.db.get(args.exchangeId);

    if (!exchange) throw new Error("Exchange not found");

    // Verify ownership
    if (
      exchange.userId.toString() !== user._id.toString() &&
      exchange.partnerId.toString() !== user._id.toString()
    ) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.exchangeId, { status: args.status });
  },
});

// ─── rate ──────────────────────────────────────────────────────
export const rate = mutation({
  args: {
    exchangeId: v.id("exchanges"),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const exchange = await ctx.db.get(args.exchangeId);

    if (!exchange) throw new Error("Exchange not found");

    if (
      exchange.userId.toString() !== user._id.toString() &&
      exchange.partnerId.toString() !== user._id.toString()
    ) {
      throw new Error("Not authorized");
    }

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    await ctx.db.patch(args.exchangeId, { rating: args.rating });
  },
});

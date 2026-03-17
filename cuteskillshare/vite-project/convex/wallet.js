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

// ─── getBalance ────────────────────────────────────────────────
export const getBalance = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user ? user.skillCoins : 0;
  },
});

// ─── getStats ──────────────────────────────────────────────────
// Returns total earned, total spent, and current balance
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    let totalEarned = 0;
    let totalSpent = 0;

    for (const t of transactions) {
      if (t.type === "earned") totalEarned += t.amount;
      else if (t.type === "spent") totalSpent += t.amount;
    }

    return {
      balance: user.skillCoins,
      totalEarned,
      totalSpent,
    };
  },
});

// ─── listTransactions ──────────────────────────────────────────
// Filtered by type: "all" | "earned" | "spent"
export const listTransactions = query({
  args: { filterType: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    if (!args.filterType || args.filterType === "all") {
      return transactions;
    }

    return transactions.filter((t) => t.type === args.filterType);
  },
});

// ─── addCoins ──────────────────────────────────────────────────
// Internal: credit coins to user + log transaction
export const addCoins = mutation({
  args: {
    amount: v.number(),
    label: v.string(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Update balance
    await ctx.db.patch(user._id, {
      skillCoins: user.skillCoins + args.amount,
    });

    // Log transaction
    await ctx.db.insert("transactions", {
      userId: user._id,
      type: "earned",
      label: args.label,
      amount: args.amount,
      icon: args.icon || "Coins",
      createdAt: Date.now(),
    });

    return user.skillCoins + args.amount;
  },
});

// ─── deductCoins ───────────────────────────────────────────────
// Internal: debit coins from user + log transaction
export const deductCoins = mutation({
  args: {
    amount: v.number(),
    label: v.string(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (user.skillCoins < args.amount) {
      throw new Error("Insufficient SkillCoins");
    }

    // Update balance
    await ctx.db.patch(user._id, {
      skillCoins: user.skillCoins - args.amount,
    });

    // Log transaction
    await ctx.db.insert("transactions", {
      userId: user._id,
      type: "spent",
      label: args.label,
      amount: args.amount,
      icon: args.icon || "ShoppingCart",
      createdAt: Date.now(),
    });

    return user.skillCoins - args.amount;
  },
});

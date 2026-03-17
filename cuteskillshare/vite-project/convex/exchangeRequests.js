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

// ─── create ────────────────────────────────────────────────────
// Submit a new exchange request from NewExchangeModal
export const create = mutation({
  args: {
    offerSkill: v.string(),
    offerCategory: v.string(),
    offerLevel: v.string(),
    learnSkill: v.string(),
    learnCategory: v.string(),
    learnLevel: v.string(),
    availability: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const requestId = await ctx.db.insert("exchangeRequests", {
      userId: user._id,
      offerSkill: args.offerSkill,
      offerCategory: args.offerCategory,
      offerLevel: args.offerLevel,
      learnSkill: args.learnSkill,
      learnCategory: args.learnCategory,
      learnLevel: args.learnLevel,
      availability: args.availability,
      description: args.description || "",
      status: "open",
    });

    return requestId;
  },
});

// ─── listByUser ────────────────────────────────────────────────
// Get current user's exchange requests
export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    return await ctx.db
      .query("exchangeRequests")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// ─── cancel ────────────────────────────────────────────────────
export const cancel = mutation({
  args: { requestId: v.id("exchangeRequests") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const request = await ctx.db.get(args.requestId);

    if (!request) throw new Error("Request not found");
    if (request.userId.toString() !== user._id.toString()) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.requestId, { status: "closed" });
  },
});

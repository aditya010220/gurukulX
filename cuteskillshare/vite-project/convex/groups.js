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
// All groups with member counts and membership status for current user
export const list = query({
  args: {
    search: v.optional(v.string()),
    tab: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    let currentUser = null;

    if (identity) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();
    }

    let groups = await ctx.db.query("groups").collect();

    // Search filter
    if (args.search && args.search.trim()) {
      const query = args.search.toLowerCase();
      groups = groups.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.description.toLowerCase().includes(query) ||
          g.category.toLowerCase().includes(query)
      );
    }

    // Enrich with member count and user's membership status
    const enriched = await Promise.all(
      groups.map(async (group) => {
        const members = await ctx.db
          .query("groupMemberships")
          .withIndex("by_group", (q) => q.eq("groupId", group._id))
          .collect();

        let isJoined = false;
        if (currentUser) {
          isJoined = members.some(
            (m) => m.userId.toString() === currentUser._id.toString()
          );
        }

        return {
          ...group,
          memberCount: members.length,
          isJoined,
        };
      })
    );

    // Tab filter
    if (args.tab === "my-groups" && currentUser) {
      return enriched.filter((g) => g.isJoined);
    }

    return enriched;
  },
});

// ─── join ──────────────────────────────────────────────────────
export const join = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Verify group exists
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    // Check if already joined
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const alreadyJoined = memberships.some(
      (m) => m.groupId.toString() === args.groupId.toString()
    );

    if (alreadyJoined) throw new Error("Already a member");

    await ctx.db.insert("groupMemberships", {
      groupId: args.groupId,
      userId: user._id,
    });

    return { success: true };
  },
});

// ─── leave ─────────────────────────────────────────────────────
export const leave = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const membership = memberships.find(
      (m) => m.groupId.toString() === args.groupId.toString()
    );

    if (!membership) throw new Error("Not a member");

    await ctx.db.delete(membership._id);
    return { success: true };
  },
});

// ─── getMembers ────────────────────────────────────────────────
export const getMembers = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("groupMemberships")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const members = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return {
          _id: user?._id,
          name: user?.name || "Unknown",
          avatar: user?.avatar || "",
          title: user?.title || "",
        };
      })
    );

    return members;
  },
});

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

// List notifications for current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_receiver", (q) => q.eq("receiverId", user._id))
      .order("desc")
      .collect();

    // Enrich notifications with sender info
    const enriched = await Promise.all(
      notifications.map(async (n) => {
        const sender = await ctx.db.get(n.senderId);
        return {
          ...n,
          senderName: sender?.name || "Someone",
          senderAvatar: sender?.avatar || "",
        };
      })
    );

    return enriched;
  },
});

// Mark single notification as read
export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");

    if (notification.receiverId.toString() !== user._id.toString()) {
      throw new Error("Unauthorized to access this notification");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });
    return { success: true };
  },
});

// Mark all notifications as read
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_receiver_unread", (q) =>
        q.eq("receiverId", user._id).eq("isRead", false)
      )
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { isRead: true });
    }

    return { success: true, count: unread.length };
  },
});

// Create a notification manually (e.g. from client for Session Started, New Message)
export const create = mutation({
  args: {
    receiverId: v.id("users"),
    type: v.string(), // "Connection Request" | "Connection Accepted" | "Connection Rejected" | "Session Started" | "Booking Confirmed" | "New Message"
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const notificationId = await ctx.db.insert("notifications", {
      receiverId: args.receiverId,
      senderId: user._id,
      type: args.type,
      title: args.title,
      message: args.message,
      isRead: false,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

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

// Send Connection Request
export const sendRequest = mutation({
  args: {
    receiverId: v.id("users"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (user._id.toString() === args.receiverId.toString()) {
      throw new Error("Cannot connect with yourself");
    }

    // Check if connection already exists in either direction
    const existing1 = await ctx.db
      .query("connections")
      .withIndex("by_requester_receiver", (q) =>
        q.eq("requesterId", user._id).eq("receiverId", args.receiverId)
      )
      .unique();

    const existing2 = await ctx.db
      .query("connections")
      .withIndex("by_requester_receiver", (q) =>
        q.eq("requesterId", args.receiverId).eq("receiverId", user._id)
      )
      .unique();

    const existing = existing1 || existing2;

    if (existing) {
      if (existing.status === "Accepted") {
        return { success: true, connectionId: existing._id, status: "Accepted" };
      }
      if (existing.status === "Pending") {
        return { success: true, connectionId: existing._id, status: "Pending" };
      }
      // If rejected, let's update it back to pending
      await ctx.db.patch(existing._id, {
        requesterId: user._id,
        receiverId: args.receiverId,
        status: "Pending",
        createdAt: Date.now(),
      });
      
      // Create notification
      await ctx.db.insert("notifications", {
        receiverId: args.receiverId,
        senderId: user._id,
        type: "Connection Request",
        title: "Connection Request",
        message: args.message || `${user.name} wants to connect with you and exchange skills.`,
        isRead: false,
        createdAt: Date.now(),
      });

      return { success: true, connectionId: existing._id, status: "Pending" };
    }

    const connectionId = await ctx.db.insert("connections", {
      requesterId: user._id,
      receiverId: args.receiverId,
      status: "Pending",
      createdAt: Date.now(),
    });

    // Create Connection Request Notification
    await ctx.db.insert("notifications", {
      receiverId: args.receiverId,
      senderId: user._id,
      type: "Connection Request",
      title: "Connection Request",
      message: args.message || `${user.name} wants to connect with you and exchange skills.`,
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true, connectionId, status: "Pending" };
  },
});

// Accept Connection Request
export const acceptRequest = mutation({
  args: { connectionId: v.id("connections") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) throw new Error("Connection request not found");

    if (connection.receiverId.toString() !== user._id.toString()) {
      throw new Error("Unauthorized to accept this connection request");
    }

    await ctx.db.patch(args.connectionId, {
      status: "Accepted",
    });

    // Create Connection Accepted Notification for requester
    await ctx.db.insert("notifications", {
      receiverId: connection.requesterId,
      senderId: user._id,
      type: "Connection Accepted",
      title: "Connection Request Accepted",
      message: `${user.name} accepted your connection request.`,
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Reject Connection Request
export const rejectRequest = mutation({
  args: { connectionId: v.id("connections") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) throw new Error("Connection request not found");

    if (connection.receiverId.toString() !== user._id.toString()) {
      throw new Error("Unauthorized to reject this connection request");
    }

    await ctx.db.patch(args.connectionId, {
      status: "Rejected",
    });

    // Create Connection Rejected Notification for requester
    await ctx.db.insert("notifications", {
      receiverId: connection.requesterId,
      senderId: user._id,
      type: "Connection Rejected",
      title: "Connection Request Rejected",
      message: `Your connection request to ${user.name} has been rejected.`,
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Check connection status between current user and another user
export const checkConnection = query({
  args: { partnerId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { connected: false, status: null };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return { connected: false, status: null };

    const conn1 = await ctx.db
      .query("connections")
      .withIndex("by_requester_receiver", (q) =>
        q.eq("requesterId", user._id).eq("receiverId", args.partnerId)
      )
      .unique();

    const conn2 = await ctx.db
      .query("connections")
      .withIndex("by_requester_receiver", (q) =>
        q.eq("requesterId", args.partnerId).eq("receiverId", user._id)
      )
      .unique();

    const conn = conn1 || conn2;
    if (!conn) return { connected: false, status: null };

    return {
      connected: conn.status === "Accepted",
      status: conn.status,
      connectionId: conn._id,
    };
  },
});

// List all connected users
export const listConnected = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const reqs = await ctx.db
      .query("connections")
      .withIndex("by_requester", (q) => q.eq("requesterId", user._id))
      .collect();

    const recs = await ctx.db
      .query("connections")
      .withIndex("by_receiver", (q) => q.eq("receiverId", user._id))
      .collect();

    const all = [...reqs, ...recs].filter((c) => c.status === "Accepted");

    const connectedUsers = [];
    for (const conn of all) {
      const partnerId = conn.requesterId.toString() === user._id.toString()
        ? conn.receiverId
        : conn.requesterId;
      
      const partner = await ctx.db.get(partnerId);
      if (partner) {
        connectedUsers.push({
          connectionId: conn._id,
          user: partner,
          createdAt: conn.createdAt,
        });
      }
    }

    return connectedUsers;
  },
});

// Respond to connection request by senderId (Accept / Reject)
export const respondBySender = mutation({
  args: {
    senderId: v.id("users"),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const connection = await ctx.db
      .query("connections")
      .withIndex("by_requester_receiver", (q) =>
        q.eq("requesterId", args.senderId).eq("receiverId", user._id)
      )
      .unique();

    if (!connection) throw new Error("Connection request not found");
    if (connection.status !== "Pending") {
      return { success: true, alreadyHandled: true };
    }

    if (args.accept) {
      await ctx.db.patch(connection._id, { status: "Accepted" });

      // Create notification
      await ctx.db.insert("notifications", {
        receiverId: connection.requesterId,
        senderId: user._id,
        type: "Connection Accepted",
        title: "Connection Request Accepted",
        message: `${user.name} accepted your connection request.`,
        isRead: false,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.patch(connection._id, { status: "Rejected" });

      // Create notification
      await ctx.db.insert("notifications", {
        receiverId: connection.requesterId,
        senderId: user._id,
        type: "Connection Rejected",
        title: "Connection Request Rejected",
        message: `Your connection request to ${user.name} has been rejected.`,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

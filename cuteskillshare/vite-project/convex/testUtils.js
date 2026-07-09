import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Setup Test Users ──────────────────────────────────────────
export const setupTestUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if Alice exists
    let alice = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", "test_alice"))
      .unique();

    if (!alice) {
      const aliceId = await ctx.db.insert("users", {
        clerkId: "test_alice",
        name: "Alice (React Learner)",
        email: "alice@test.com",
        skills: ["CSS", "HTML"],
        learningGoals: ["React"],
        skillCoins: 100,
        currentStreak: 1,
        totalExchanges: 0,
        title: "Frontend Beginner",
        location: "New York, NY",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      });
      alice = await ctx.db.get(aliceId);
    }

    // Check if Bob exists
    let bob = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", "test_bob"))
      .unique();

    if (!bob) {
      const bobId = await ctx.db.insert("users", {
        clerkId: "test_bob",
        name: "Bob (React Expert)",
        email: "bob@test.com",
        skills: ["React", "JavaScript"],
        learningGoals: ["CSS"],
        skillCoins: 100,
        currentStreak: 1,
        totalExchanges: 0,
        title: "Senior Developer",
        location: "San Francisco, CA",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      });
      bob = await ctx.db.get(bobId);
    }

    return { alice, bob };
  },
});

// ─── Get Test Users ────────────────────────────────────────────
export const getTestUsers = query({
  args: {},
  handler: async (ctx) => {
    const alice = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", "test_alice"))
      .unique();

    const bob = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", "test_bob"))
      .unique();

    return { alice, bob };
  },
});

// ─── Reset Test State ──────────────────────────────────────────
export const resetTestState = mutation({
  args: {
    aliceId: v.id("users"),
    bobId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 1. Delete connections between them
    const conns = await ctx.db
      .query("connections")
      .collect();

    const connsToDelete = conns.filter(
      (c) =>
        (c.requesterId.toString() === args.aliceId.toString() &&
          c.receiverId.toString() === args.bobId.toString()) ||
        (c.requesterId.toString() === args.bobId.toString() &&
          c.receiverId.toString() === args.aliceId.toString())
    );

    for (const c of connsToDelete) {
      await ctx.db.delete(c._id);
    }

    // 2. Delete sessions between them
    const sessions = await ctx.db
      .query("sessions")
      .collect();

    const sessionsToDelete = sessions.filter(
      (s) =>
        s.participants.some((p) => p.toString() === args.aliceId.toString()) &&
        s.participants.some((p) => p.toString() === args.bobId.toString())
    );

    for (const s of sessionsToDelete) {
      await ctx.db.delete(s._id);
    }

    // 3. Delete notifications between them
    const notifications = await ctx.db
      .query("notifications")
      .collect();

    const notifsToDelete = notifications.filter(
      (n) =>
        (n.senderId.toString() === args.aliceId.toString() &&
          n.receiverId.toString() === args.bobId.toString()) ||
        (n.senderId.toString() === args.bobId.toString() &&
          n.receiverId.toString() === args.aliceId.toString())
    );

    for (const n of notifsToDelete) {
      await ctx.db.delete(n._id);
    }

    return { success: true };
  },
});

// ─── Send Test Connection Request ────────────────────────────────
export const sendTestConnection = mutation({
  args: {
    senderId: v.id("users"),
    receiverId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const connectionId = await ctx.db.insert("connections", {
      requesterId: args.senderId,
      receiverId: args.receiverId,
      status: "Pending",
      createdAt: Date.now(),
    });

    const sender = await ctx.db.get(args.senderId);

    // Create Notification
    await ctx.db.insert("notifications", {
      receiverId: args.receiverId,
      senderId: args.senderId,
      type: "Connection Request",
      title: "Connection Request",
      message: `${sender.name} wants to connect with you and exchange skills.`,
      isRead: false,
      createdAt: Date.now(),
    });

    return connectionId;
  },
});

// ─── Accept Test Connection Request ──────────────────────────────
export const acceptTestConnection = mutation({
  args: {
    connectionId: v.id("connections"),
    receiverId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conn = await ctx.db.get(args.connectionId);
    if (!conn) throw new Error("Connection not found");

    await ctx.db.patch(args.connectionId, {
      status: "Accepted",
    });

    const receiver = await ctx.db.get(args.receiverId);

    // Create Notification
    await ctx.db.insert("notifications", {
      receiverId: conn.requesterId,
      senderId: args.receiverId,
      type: "Connection Accepted",
      title: "Connection Request Accepted",
      message: `${receiver.name} accepted your connection request.`,
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// ─── Reject Test Connection Request ──────────────────────────────
export const rejectTestConnection = mutation({
  args: {
    connectionId: v.id("connections"),
    receiverId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conn = await ctx.db.get(args.connectionId);
    if (!conn) throw new Error("Connection not found");

    await ctx.db.patch(args.connectionId, {
      status: "Rejected",
    });

    const receiver = await ctx.db.get(args.receiverId);

    // Create Notification
    await ctx.db.insert("notifications", {
      receiverId: conn.requesterId,
      senderId: args.receiverId,
      type: "Connection Rejected",
      title: "Connection Request Rejected",
      message: `${receiver.name} declined your connection request.`,
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// ─── Get Test Connection Status ──────────────────────────────────
export const getTestConnectionStatus = query({
  args: {
    aliceId: v.id("users"),
    bobId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conn1 = await ctx.db
      .query("connections")
      .withIndex("by_requester_receiver", (q) =>
        q.eq("requesterId", args.aliceId).eq("receiverId", args.bobId)
      )
      .unique();

    const conn2 = await ctx.db
      .query("connections")
      .withIndex("by_requester_receiver", (q) =>
        q.eq("requesterId", args.bobId).eq("receiverId", args.aliceId)
      )
      .unique();

    const conn = conn1 || conn2;
    if (!conn) return null;

    return {
      _id: conn._id,
      requesterId: conn.requesterId,
      receiverId: conn.receiverId,
      status: conn.status,
    };
  },
});

// ─── Create Test Session ──────────────────────────────────────────
export const createTestSession = mutation({
  args: {
    aliceId: v.id("users"),
    bobId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Generate new sessionId
    const sessionId = `test_swap_${args.aliceId.toString().substring(0, 6)}_${args.bobId.toString().substring(0, 6)}_${Date.now()}`;

    await ctx.db.insert("sessions", {
      sessionId,
      participants: [args.aliceId, args.bobId],
      callStatus: "active",
      createdAt: Date.now(),
    });

    return { sessionId };
  },
});

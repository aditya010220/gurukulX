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

// Get details of a session by sessionId, verifying authentication and authorization
export const getBySessionId = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    // 1. Check if there's a course booking with this sessionId
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (booking) {
      const isStudent = booking.studentId.toString() === user._id.toString();
      const isMentor = booking.mentorId.toString() === user._id.toString();

      if (!isStudent && !isMentor) {
        throw new Error("Unauthorized: You are not a participant in this course session");
      }

      const student = await ctx.db.get(booking.studentId);
      const mentor = await ctx.db.get(booking.mentorId);
      const course = await ctx.db.get(booking.courseId);

      return {
        type: "course",
        booking,
        student,
        mentor,
        course,
        authorized: true,
      };
    }

    // 2. Check if there's a custom swap session in `sessions` table
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (session) {
      const isParticipant = session.participants.some(
        (pId) => pId.toString() === user._id.toString()
      );
      if (!isParticipant) {
        throw new Error("Unauthorized: You are not a participant in this session");
      }

      const partnerId = session.participants.find(
        (pId) => pId.toString() !== user._id.toString()
      );
      if (!partnerId) {
        throw new Error("Invalid session state");
      }

      // Verify that the participants are connected
      const conn1 = await ctx.db
        .query("connections")
        .withIndex("by_requester_receiver", (q) =>
          q.eq("requesterId", user._id).eq("receiverId", partnerId)
        )
        .unique();
      const conn2 = await ctx.db
        .query("connections")
        .withIndex("by_requester_receiver", (q) =>
          q.eq("requesterId", partnerId).eq("receiverId", user._id)
        )
        .unique();

      const conn = conn1 || conn2;
      if (!conn || conn.status !== "Accepted") {
        throw new Error("Unauthorized: You must be connected to this co-learner to start or join a session");
      }

      const partner = await ctx.db.get(partnerId);

      return {
        type: "swap",
        session,
        partner,
        authorized: true,
      };
    }

    throw new Error("Session not found");
  },
});

// Retrieve or create a sessionId for a swap session between connected users
export const getOrCreateSwapSession = mutation({
  args: { partnerId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Verify connection status
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
    if (!conn || conn.status !== "Accepted") {
      throw new Error("Unauthorized: You must be connected to this co-learner to start a session");
    }

    // Check for an existing swap session between these users
    const allSessions = await ctx.db.query("sessions").collect();
    const existing = allSessions.find(
      (s) =>
        s.participants.some((p) => p.toString() === user._id.toString()) &&
        s.participants.some((p) => p.toString() === args.partnerId.toString()) &&
        !s.bookingId
    );

    if (existing) {
      return { sessionId: existing.sessionId };
    }

    // Generate new sessionId
    const sessionId = `swap_${user._id.toString().substring(0, 8)}_${args.partnerId.toString().substring(0, 8)}_${Date.now()}`;

    await ctx.db.insert("sessions", {
      sessionId,
      participants: [user._id, args.partnerId],
      callStatus: "active",
      createdAt: Date.now(),
    });

    // Notify partner of started session
    await ctx.db.insert("notifications", {
      receiverId: args.partnerId,
      senderId: user._id,
      type: "Session Started",
      title: "Co-learning Session Started",
      message: `${user.name} has started a co-learning session. Click to join!`,
      isRead: false,
      createdAt: Date.now(),
    });

    return { sessionId };
  },
});

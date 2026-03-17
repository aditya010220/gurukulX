import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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

// ─── getForUser ────────────────────────────────────────────────
// Get smart matches for current user (suggested status)
export const getForUser = query({
  args: {
    filter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const matches = await ctx.db
      .query("smartMatches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Filter by status (only show suggested by default)
    let filtered = matches.filter((m) => m.status === "suggested");

    // Filter by score
    if (args.filter === "90+") {
      filtered = filtered.filter((m) => m.compatibilityScore >= 90);
    } else if (args.filter === "80+") {
      filtered = filtered.filter((m) => m.compatibilityScore >= 80);
    }

    // Sort by compatibility score desc
    filtered.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Enrich with matched user data
    const enriched = await Promise.all(
      filtered.map(async (match) => {
        const matchedUser = await ctx.db.get(match.matchedUserId);
        return {
          ...match,
          matchedUserName: matchedUser?.name || "Unknown",
          matchedUserAvatar: matchedUser?.avatar || "",
          matchedUserTitle: matchedUser?.title || "",
          matchedUserSkills: matchedUser?.skills || [],
          matchedUserLearningGoals: matchedUser?.learningGoals || [],
        };
      })
    );

    return enriched;
  },
});

// ─── connect ───────────────────────────────────────────────────
// "Connect & Exchange" — mark match as connected and create exchange
export const connect = mutation({
  args: { matchId: v.id("smartMatches") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const match = await ctx.db.get(args.matchId);

    if (!match) throw new Error("Match not found");
    if (match.userId.toString() !== user._id.toString()) {
      throw new Error("Not authorized");
    }

    // Mark match as connected
    await ctx.db.patch(args.matchId, { status: "connected" });

    // Find complementary skills to create exchange
    const matchedUser = await ctx.db.get(match.matchedUserId);
    if (!matchedUser) throw new Error("Matched user not found");

    // Find skill intersections
    const teachingSkill =
      user.skills.find((s) => matchedUser.learningGoals.includes(s)) ||
      user.skills[0] ||
      "General";

    const learningSkill =
      matchedUser.skills.find((s) => user.learningGoals.includes(s)) ||
      matchedUser.skills[0] ||
      "General";

    // Create exchange
    const exchangeId = await ctx.db.insert("exchanges", {
      userId: user._id,
      partnerId: match.matchedUserId,
      teachingSkill,
      learningSkill,
      status: "pending",
      completedSessions: 0,
      totalSessions: 8,
      nextSession: "",
    });

    return exchangeId;
  },
});

// ─── dismiss ───────────────────────────────────────────────────
export const dismiss = mutation({
  args: { matchId: v.id("smartMatches") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const match = await ctx.db.get(args.matchId);

    if (!match) throw new Error("Match not found");
    if (match.userId.toString() !== user._id.toString()) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.matchId, { status: "dismissed" });
  },
});

// ─── computeMatches (internal mutation) ────────────────────────
// Called by the refresh action to compute new matches
export const computeMatches = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Clear old suggested matches
    const existingMatches = await ctx.db
      .query("smartMatches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const match of existingMatches) {
      if (match.status === "suggested") {
        await ctx.db.delete(match._id);
      }
    }

    // Get all other users
    const allUsers = await ctx.db.query("users").collect();
    const candidates = allUsers.filter(
      (u) => u._id.toString() !== user._id.toString()
    );

    // Calculate compatibility scores
    const scored = candidates
      .map((candidate) => {
        let score = 0;
        let maxScore = 0;

        // Check if candidate's skills match user's learning goals
        for (const goal of user.learningGoals) {
          maxScore += 25;
          if (candidate.skills.includes(goal)) score += 25;
        }

        // Check if user's skills match candidate's learning goals
        for (const goal of candidate.learningGoals) {
          maxScore += 25;
          if (user.skills.includes(goal)) score += 25;
        }

        // Normalize to 0-100
        const compatibilityScore =
          maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

        return { candidateId: candidate._id, compatibilityScore };
      })
      .filter((s) => s.compatibilityScore > 0)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10);

    // Insert new matches
    for (const s of scored) {
      // Skip if already connected/dismissed
      const existingRelation = existingMatches.find(
        (m) =>
          m.matchedUserId.toString() === s.candidateId.toString() &&
          (m.status === "connected" || m.status === "dismissed")
      );
      if (existingRelation) continue;

      await ctx.db.insert("smartMatches", {
        userId: user._id,
        matchedUserId: s.candidateId,
        compatibilityScore: s.compatibilityScore,
        status: "suggested",
      });
    }
  },
});

// ─── refresh ───────────────────────────────────────────────────
// Action: re-compute matches for current user
export const refresh = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    // Clear old suggested matches
    const existingMatches = await ctx.db
      .query("smartMatches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const match of existingMatches) {
      if (match.status === "suggested") {
        await ctx.db.delete(match._id);
      }
    }

    // Get all other users
    const allUsers = await ctx.db.query("users").collect();
    const candidates = allUsers.filter(
      (u) => u._id.toString() !== user._id.toString()
    );

    // Calculate compatibility scores
    const scored = candidates
      .map((candidate) => {
        let score = 0;
        let maxScore = 0;

        for (const goal of user.learningGoals) {
          maxScore += 25;
          if (candidate.skills.includes(goal)) score += 25;
        }

        for (const goal of candidate.learningGoals) {
          maxScore += 25;
          if (user.skills.includes(goal)) score += 25;
        }

        const compatibilityScore =
          maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

        return { candidateId: candidate._id, compatibilityScore };
      })
      .filter((s) => s.compatibilityScore > 0)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10);

    // Insert new matches
    for (const s of scored) {
      const existingRelation = existingMatches.find(
        (m) =>
          m.matchedUserId.toString() === s.candidateId.toString() &&
          (m.status === "connected" || m.status === "dismissed")
      );
      if (existingRelation) continue;

      await ctx.db.insert("smartMatches", {
        userId: user._id,
        matchedUserId: s.candidateId,
        compatibilityScore: s.compatibilityScore,
        status: "suggested",
      });
    }

    return { success: true };
  },
});

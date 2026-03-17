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
// Paginated community feed, newest first
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const posts = await ctx.db
      .query("communityPosts")
      .withIndex("by_created")
      .order("desc")
      .take(limit);

    // Get current user for isLiked check
    const identity = await ctx.auth.getUserIdentity();
    let currentUser = null;
    if (identity) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();
    }

    // Enrich with author data and isLiked status
    const enriched = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        
        // Check if current user liked this post
        let isLiked = false;
        if (currentUser) {
          const like = await ctx.db
            .query("postLikes")
            .withIndex("by_post_user", (q) =>
              q.eq("postId", post._id).eq("userId", currentUser._id)
            )
            .unique();
          isLiked = !!like;
        }

        return {
          ...post,
          authorName: author?.name || "Unknown",
          authorAvatar: author?.avatar || "",
          authorTitle: author?.title || "",
          isLiked,
        };
      })
    );

    return enriched;
  },
});

// ─── create ────────────────────────────────────────────────────
export const create = mutation({
  args: {
    content: v.string(),
    achievement: v.optional(v.string()),
    skillTags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (!args.content.trim()) throw new Error("Content cannot be empty");

    const postId = await ctx.db.insert("communityPosts", {
      authorId: user._id,
      content: args.content,
      achievement: args.achievement,
      skillTags: args.skillTags,
      likes: 0,
      commentsCount: 0,
      createdAt: Date.now(),
    });

    return postId;
  },
});

// ─── like ──────────────────────────────────────────────────────
// Toggle like — prevents duplicates using compound index
export const like = mutation({
  args: { postId: v.id("communityPosts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Check if already liked
    const existing = await ctx.db
      .query("postLikes")
      .withIndex("by_post_user", (q) =>
        q.eq("postId", args.postId).eq("userId", user._id)
      )
      .unique();

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (existing) {
      // Unlike — remove like + decrement counter
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, {
        likes: Math.max(0, post.likes - 1),
      });
      return { liked: false };
    } else {
      // Like — insert like + increment counter
      await ctx.db.insert("postLikes", {
        postId: args.postId,
        userId: user._id,
      });
      await ctx.db.patch(args.postId, {
        likes: post.likes + 1,
      });
      return { liked: true };
    }
  },
});

// ─── isLiked ───────────────────────────────────────────────────
// Check if current user liked a post
export const isLiked = query({
  args: { postId: v.id("communityPosts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return false;

    const existing = await ctx.db
      .query("postLikes")
      .withIndex("by_post_user", (q) =>
        q.eq("postId", args.postId).eq("userId", user._id)
      )
      .unique();

    return !!existing;
  },
});

// ─── getComments ───────────────────────────────────────────────
export const getComments = query({
  args: { postId: v.id("communityPosts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("postComments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc")
      .collect();

    // Enrich with author data
    const enriched = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        return {
          ...comment,
          authorName: author?.name || "Unknown",
          authorAvatar: author?.avatar || "",
        };
      })
    );

    return enriched;
  },
});

// ─── addComment ────────────────────────────────────────────────
export const addComment = mutation({
  args: {
    postId: v.id("communityPosts"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (!args.text.trim()) throw new Error("Comment cannot be empty");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    await ctx.db.insert("postComments", {
      postId: args.postId,
      authorId: user._id,
      text: args.text,
      createdAt: Date.now(),
    });

    // Increment comment count
    await ctx.db.patch(args.postId, {
      commentsCount: post.commentsCount + 1,
    });
  },
});

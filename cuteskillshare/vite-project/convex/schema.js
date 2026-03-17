import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    skills: v.array(v.string()),
    learningGoals: v.array(v.string()),
    skillCoins: v.number(),
    currentStreak: v.number(),
    totalExchanges: v.number(),
    title: v.string(),
    location: v.string(),
    avatar: v.string(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_name", ["name"]),

  exchanges: defineTable({
    userId: v.id("users"),
    partnerId: v.id("users"),
    teachingSkill: v.string(),
    learningSkill: v.string(),
    status: v.string(), // "active" | "completed" | "pending"
    completedSessions: v.number(),
    totalSessions: v.number(),
    nextSession: v.string(),
    rating: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_partner", ["partnerId"])
    .index("by_status", ["status"]),

  exchangeRequests: defineTable({
    userId: v.id("users"),
    offerSkill: v.string(),
    offerCategory: v.string(),
    offerLevel: v.string(),
    learnSkill: v.string(),
    learnCategory: v.string(),
    learnLevel: v.string(),
    availability: v.string(),
    description: v.string(),
    status: v.string(), // "open" | "matched" | "closed"
  })
    .index("by_user", ["userId"]),

  smartMatches: defineTable({
    userId: v.id("users"),
    matchedUserId: v.id("users"),
    compatibilityScore: v.number(),
    status: v.string(), // "suggested" | "connected" | "dismissed"
  })
    .index("by_user", ["userId"]),

  communityPosts: defineTable({
    authorId: v.id("users"),
    content: v.string(),
    achievement: v.optional(v.string()),
    skillTags: v.array(v.string()),
    likes: v.number(),
    commentsCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_created", ["createdAt"]),

  postLikes: defineTable({
    postId: v.id("communityPosts"),
    userId: v.id("users"),
  })
    .index("by_post_user", ["postId", "userId"]),

  postComments: defineTable({
    postId: v.id("communityPosts"),
    authorId: v.id("users"),
    text: v.string(),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"]),

  marketplaceOfferings: defineTable({
    instructorId: v.id("users"),
    title: v.string(),
    description: v.string(),
    coverImage: v.string(),
    duration: v.string(),
    level: v.string(),
    category: v.string(),
    price: v.number(),
    rating: v.number(),
    studentsCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_created", ["createdAt"]),

  enrollments: defineTable({
    userId: v.id("users"),
    offeringId: v.id("marketplaceOfferings"),
    enrolledAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_offering", ["offeringId"]),

  groups: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(),
    icon: v.string(),
    color: v.string(),
  }),

  groupMemberships: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"]),

  transactions: defineTable({
    userId: v.id("users"),
    type: v.string(), // "earned" | "spent"
    label: v.string(),
    amount: v.number(),
    icon: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),

  chatMessages: defineTable({
    userId: v.id("users"),
    role: v.string(), // "user" | "assistant"
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),
});

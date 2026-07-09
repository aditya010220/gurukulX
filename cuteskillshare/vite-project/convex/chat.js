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

// ─── getHistory ────────────────────────────────────────────────
// Load past chat messages for current user
export const getHistory = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("asc")
      .collect();

    return messages;
  },
});

// ─── sendMessage ───────────────────────────────────────────────
// Save user message and generate AI response
export const sendMessage = mutation({
  args: { content: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (!args.content.trim()) throw new Error("Message cannot be empty");

    // Save user message
    await ctx.db.insert("chatMessages", {
      userId: user._id,
      role: "user",
      content: args.content,
      createdAt: Date.now(),
    });

    // Generate contextual AI response based on user's message
    const response = generateAIResponse(args.content, user);

    // Save assistant response
    await ctx.db.insert("chatMessages", {
      userId: user._id,
      role: "assistant",
      content: response,
      createdAt: Date.now() + 1,
    });

    return { response };
  },
});

// ─── clearHistory ──────────────────────────────────────────────
export const clearHistory = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    return { success: true };
  },
});

// ─── saveMessage ───────────────────────────────────────────────
export const saveMessage = mutation({
  args: { role: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const messageId = await ctx.db.insert("chatMessages", {
      userId: user._id,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
    return messageId;
  },
});

// ─── AI Response Generator ────────────────────────────────────
// Smart contextual responses (replace with OpenAI API call later)
function generateAIResponse(message, user) {
  const msg = message.toLowerCase();

  if (msg.includes("plan") || msg.includes("schedule") || msg.includes("7-day")) {
    return `Here's a personalized 7-day learning plan for you, ${user.name}:

**Day 1-2:** Review fundamentals of your current learning goals
**Day 3-4:** Practice with hands-on exercises and mini-projects
**Day 5:** Schedule a skill exchange session with a matched partner
**Day 6:** Apply what you've learned in a real-world scenario
**Day 7:** Reflect, document your progress, and plan the next week

You currently have ${user.skillCoins} SkillCoins and ${user.totalExchanges} completed exchanges. Keep up the momentum! 🌱`;
  }

  if (msg.includes("match") || msg.includes("partner") || msg.includes("find")) {
    return `I can help you find great skill exchange partners! Based on your profile:

**Your Skills:** ${user.skills.length > 0 ? user.skills.join(", ") : "Not set yet"}
**Learning Goals:** ${user.learningGoals.length > 0 ? user.learningGoals.join(", ") : "Not set yet"}

💡 **Tips to improve matches:**
1. Add more specific skills to your profile
2. Update your learning goals regularly
3. Check the Smart Matches page for AI-curated suggestions
4. Try the "Refresh Matches" button for new recommendations

Would you like me to help you update your profile for better matches?`;
  }

  if (msg.includes("coin") || msg.includes("earn") || msg.includes("wallet")) {
    return `Here's how you can earn more SkillCoins:

💰 **Current Balance:** ${user.skillCoins} SkillCoins

**Ways to Earn:**
1. ✅ Complete skill exchange sessions (+50 coins each)
2. 🔥 Maintain daily streaks (+10 coins/day)
3. 📝 Post in the community (+5 coins)
4. ⭐ Get high ratings from partners (+20 coins)
5. 🎁 Refer new users (+100 coins)

**Ways to Spend:**
- Enroll in premium marketplace courses
- Boost your profile visibility
- Access advanced AI learning tools`;
  }

  if (msg.includes("help") || msg.includes("what can")) {
    return `I'm your SkillGarden AI Assistant! Here's what I can help with:

🎯 **Learning Plans** — "Create a 7-day plan for me"
🤝 **Finding Partners** — "Help me find skill exchange partners"
💰 **SkillCoins** — "How can I earn more coins?"
📊 **Progress** — "Show me my learning progress"
💡 **Tips** — "Give me tips for better exchanges"
📚 **Recommendations** — "What should I learn next?"

Just ask me anything about your learning journey!`;
  }

  if (msg.includes("progress") || msg.includes("stats")) {
    return `Here's your learning progress summary, ${user.name}:

📊 **Your Stats:**
- 🔄 Total Exchanges: ${user.totalExchanges}
- 🔥 Current Streak: ${user.currentStreak} days
- 💰 SkillCoins: ${user.skillCoins}
- 🎯 Skills: ${user.skills.length > 0 ? user.skills.join(", ") : "None added yet"}
- 📚 Learning: ${user.learningGoals.length > 0 ? user.learningGoals.join(", ") : "None set yet"}

Keep going — you're making great progress! 🌟`;
  }

  // Default response
  return `Thanks for your message, ${user.name}! I'm here to help you on your learning journey.

Here are some things I can assist with:
- 📋 Creating personalized learning plans
- 🤝 Finding skill exchange partners
- 💡 Tips for better skill exchanges
- 📊 Tracking your progress
- 💰 Managing your SkillCoins

What would you like to know more about?`;
}

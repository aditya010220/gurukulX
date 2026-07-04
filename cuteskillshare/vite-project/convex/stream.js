"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { StreamClient } from "@stream-io/node-sdk";

export const getToken = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: User is not authenticated");
    }

    const user = await ctx.runQuery(api.users.getCurrent);
    if (!user) {
      throw new Error("User not found in database");
    }

    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error("Stream environment variables are not configured in Convex dashboard");
    }

    // Initialize Stream Server Client
    const client = new StreamClient(apiKey, apiSecret);

    // Generate user token (valid for 24 hours)
    const token = client.generateUserToken({
      user_id: user._id.toString(),
      validity_in_seconds: 86400,
    });

    return {
      apiKey,
      token,
      userId: user._id.toString(),
    };
  },
});

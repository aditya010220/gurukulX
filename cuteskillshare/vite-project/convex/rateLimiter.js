import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { RATE_LIMIT_CONFIG } from "./rateLimitConfig";

/**
 * Checks and updates rate limits for a given endpoint and key.
 * Supports:
 * - "public" limits
 * - "authenticated" limits
 * - "auth" limits (per-IP/per-client and per-account with exponential backoff rather than a hard lockout)
 * 
 * Returns { allowed: true } or { allowed: false, reason: string, retryAfterSeconds: number }.
 */
export async function checkRateLimit(ctx, { key, endpoint, type }) {
  const now = Date.now();
  const config = RATE_LIMIT_CONFIG[type];
  
  if (!config) {
    throw new Error(`Invalid rate limit type: ${type}`);
  }

  // Find existing rate limit record for this key and endpoint
  const record = await ctx.db
    .query("rateLimits")
    .withIndex("by_key_endpoint", (q) => q.eq("key", key).eq("endpoint", endpoint))
    .unique();

  if (type === "auth") {
    // Auth route rate limiting: uses a combination of per-IP/client and per-account limits 
    // with exponential backoff instead of a hard permanent lockout.
    const windowMs = config.windowMs;
    const maxRequests = key.startsWith("ip:") ? config.maxPerIp : config.maxPerAccount;
    const backoffFactor = config.backoffFactor || 2.0;
    const baseBackoffMs = 1000; // 1 second base delay

    if (!record) {
      // First attempt in history
      await ctx.db.insert("rateLimits", {
        key,
        endpoint,
        hits: 1,
        windowStart: now,
        lastAttempt: now,
        consecutiveViolations: 0,
        backoffDelay: 0,
      });
      return { allowed: true };
    }

    // Check if backoff delay is currently active
    const elapsedSinceLastAttempt = now - record.lastAttempt;
    const currentBackoffDelay = record.backoffDelay || 0;

    if (currentBackoffDelay > 0 && elapsedSinceLastAttempt < currentBackoffDelay) {
      // VIOLATION: Tried to request while backoff is still active.
      // Increment consecutive violations and multiply/exponentially scale the backoff delay
      const newViolations = (record.consecutiveViolations || 0) + 1;
      const newBackoffDelay = Math.min(
        baseBackoffMs * Math.pow(backoffFactor, newViolations),
        60 * 60 * 1000 // Cap backoff delay at 1 hour
      );

      await ctx.db.patch(record._id, {
        lastAttempt: now,
        consecutiveViolations: newViolations,
        backoffDelay: newBackoffDelay,
      });

      const remainingBackoff = Math.ceil((currentBackoffDelay - elapsedSinceLastAttempt) / 1000);
      return {
        allowed: false,
        reason: `Too many login/signup attempts. Please wait ${remainingBackoff} seconds.`,
        retryAfterSeconds: remainingBackoff,
      };
    }

    // Check if the current fixed-window has expired
    const inWindow = now - record.windowStart < windowMs;
    let hits = record.hits;
    let consecutiveViolations = record.consecutiveViolations || 0;
    let backoffDelay = record.backoffDelay || 0;

    if (!inWindow) {
      // Reset window hit count
      hits = 1;
      // If they waited out their backoff delay successfully, cool down the violations
      if (elapsedSinceLastAttempt >= currentBackoffDelay) {
        consecutiveViolations = 0;
        backoffDelay = 0;
      }
    } else {
      hits += 1;
    }

    if (hits > maxRequests) {
      // Limit exceeded! Trigger/increase backoff delay
      consecutiveViolations += 1;
      backoffDelay = Math.min(
        baseBackoffMs * Math.pow(backoffFactor, consecutiveViolations),
        60 * 60 * 1000 // Cap backoff delay at 1 hour
      );

      await ctx.db.patch(record._id, {
        hits,
        lastAttempt: now,
        consecutiveViolations,
        backoffDelay,
        windowStart: inWindow ? record.windowStart : now,
      });

      const retryAfter = Math.ceil(backoffDelay / 1000);
      return {
        allowed: false,
        reason: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfterSeconds: retryAfter,
      };
    }

    // Allowed request: Update record with updated hit count and step down/clear the active backoff
    await ctx.db.patch(record._id, {
      hits,
      windowStart: inWindow ? record.windowStart : now,
      lastAttempt: now,
      consecutiveViolations: Math.max(0, consecutiveViolations - 1),
      backoffDelay: 0, // clear active delay since this one was clean
    });

    return { allowed: true };
  } else {
    // Public or Authenticated rate limiting (standard sliding/fixed window)
    const windowMs = config.windowMs;
    const maxRequests = config.maxRequests;

    if (!record) {
      await ctx.db.insert("rateLimits", {
        key,
        endpoint,
        hits: 1,
        windowStart: now,
        lastAttempt: now,
      });
      return { allowed: true };
    }

    const inWindow = now - record.windowStart < windowMs;
    let hits = record.hits;

    if (!inWindow) {
      hits = 1;
    } else {
      hits += 1;
    }

    if (hits > maxRequests) {
      const resetTime = Math.ceil((record.windowStart + windowMs - now) / 1000);
      return {
        allowed: false,
        reason: `Rate limit exceeded for endpoint '${endpoint}'. Please try again in ${resetTime} seconds.`,
        retryAfterSeconds: resetTime,
      };
    }

    await ctx.db.patch(record._id, {
      hits,
      windowStart: inWindow ? record.windowStart : now,
      lastAttempt: now,
    });

    return { allowed: true };
  }
}

export const checkRateLimitMutation = mutation({
  args: {
    key: v.string(),
    endpoint: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await checkRateLimit(ctx, args);
  },
});

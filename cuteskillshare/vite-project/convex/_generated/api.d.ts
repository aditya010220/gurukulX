/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as chat from "../chat.js";
import type * as connections from "../connections.js";
import type * as exchangeRequests from "../exchangeRequests.js";
import type * as exchanges from "../exchanges.js";
import type * as gemini from "../gemini.js";
import type * as groups from "../groups.js";
import type * as notifications from "../notifications.js";
import type * as offerings from "../offerings.js";
import type * as posts from "../posts.js";
import type * as rateLimitConfig from "../rateLimitConfig.js";
import type * as rateLimiter from "../rateLimiter.js";
import type * as sessions from "../sessions.js";
import type * as smartMatches from "../smartMatches.js";
import type * as stream from "../stream.js";
import type * as testUtils from "../testUtils.js";
import type * as users from "../users.js";
import type * as validator from "../validator.js";
import type * as wallet from "../wallet.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  chat: typeof chat;
  connections: typeof connections;
  exchangeRequests: typeof exchangeRequests;
  exchanges: typeof exchanges;
  gemini: typeof gemini;
  groups: typeof groups;
  notifications: typeof notifications;
  offerings: typeof offerings;
  posts: typeof posts;
  rateLimitConfig: typeof rateLimitConfig;
  rateLimiter: typeof rateLimiter;
  sessions: typeof sessions;
  smartMatches: typeof smartMatches;
  stream: typeof stream;
  testUtils: typeof testUtils;
  users: typeof users;
  validator: typeof validator;
  wallet: typeof wallet;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

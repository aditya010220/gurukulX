// Rate Limit Configuration
// All thresholds are configurable via process.env variables, meeting the requirement of dynamic settings.
export const RATE_LIMIT_CONFIG = {
  // Stricter limits for authentication-related endpoints (e.g. login, signup, password sync)
  auth: {
    windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || "60000", 10), // 1 minute window
    maxPerAccount: parseInt(process.env.RATE_LIMIT_AUTH_MAX_ACCOUNT || "5", 10), // 5 requests per minute per account
    maxPerIp: parseInt(process.env.RATE_LIMIT_AUTH_MAX_IP || "10", 10), // 10 requests per minute per IP/client
    backoffFactor: parseFloat(process.env.RATE_LIMIT_AUTH_BACKOFF_FACTOR || "2.0"), // exponential factor
  },

  // Moderate limits for public endpoints (accessed by anonymous/unauthenticated users)
  public: {
    windowMs: parseInt(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS || "60000", 10), // 1 minute window
    maxRequests: parseInt(process.env.RATE_LIMIT_PUBLIC_MAX || "30", 10), // 30 requests per minute
  },

  // Looser limits for general authenticated user actions
  authenticated: {
    windowMs: parseInt(process.env.RATE_LIMIT_AUTHED_WINDOW_MS || "60000", 10), // 1 minute window
    maxRequests: parseInt(process.env.RATE_LIMIT_AUTHED_MAX || "100", 10), // 100 requests per minute
  },
};

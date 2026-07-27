/**
 * Sanitizes caught errors to prevent exposing stack traces, internal file paths,
 * or raw database details to the end-user.
 * Logs the full error details to the console for debugging/diagnostics.
 * 
 * @param {Error|string|unknown} err The raw error object or message.
 * @param {string} [defaultMsg] Optional custom generic message to show the user.
 * @returns {string} The sanitized, safe error message to show to the user.
 */
export function sanitizeErrorMessage(err, defaultMsg = "An unexpected error occurred. Please try again.") {
  if (!err) return defaultMsg;

  // Log full error details to the developer console/server-side interface
  console.error("Unfiltered Error details logged for developer diagnostics:", err);

  const rawMessage = typeof err === 'string' ? err : err.message || '';

  // Indicators of stack traces or internals
  const hasStackTrace = /at\s+[\w\d_$.]+\s+\(/i.test(rawMessage) || 
                        rawMessage.includes('node_modules') || 
                        rawMessage.includes('webpack');

  // Indicators of internal file paths or paths in general
  const hasFilePath = /[\/\\]/.test(rawMessage) && 
                      (/\.(js|ts|jsx|tsx|json|html|css)/.test(rawMessage) || 
                       rawMessage.includes('C:') || 
                       rawMessage.includes('Users') ||
                       rawMessage.includes('home/'));

  // Indicators of database or low-level/internal code issues
  const hasInternalDetails = /db\./i.test(rawMessage) || 
                             /schema/i.test(rawMessage) || 
                             /validator/i.test(rawMessage) || 
                             /database/i.test(rawMessage) || 
                             /internal/i.test(rawMessage) || 
                             /undefined/i.test(rawMessage) || 
                             /null/i.test(rawMessage) || 
                             /referenceerror/i.test(rawMessage) || 
                             /typeerror/i.test(rawMessage) ||
                             /syntaxerror/i.test(rawMessage) ||
                             /evalerror/i.test(rawMessage) ||
                             /rangeerror/i.test(rawMessage) ||
                             /urierror/i.test(rawMessage);

  if (hasStackTrace || hasFilePath || hasInternalDetails) {
    return defaultMsg;
  }

  // If the message exists, is short, and doesn't contain any leaking terms, return it (cleaned of prefix wrappers)
  if (rawMessage && rawMessage.length < 150) {
    return rawMessage
      .replace(/^Error:\s*/i, '')
      .replace(/^ConvexError:\s*/i, '')
      .replace(/^Uncaught\s(in promise)?\s*/i, '');
  }

  return defaultMsg;
}

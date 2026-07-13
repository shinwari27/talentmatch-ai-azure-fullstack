const rateLimit = require("express-rate-limit");

/**
 * A gap flagged explicitly since Phase 7's README and never closed until
 * now: nothing was throttling repeated login attempts, which is exactly
 * the kind of thing a real security review should catch. Limits are keyed
 * by IP by default (express-rate-limit's standard behavior).
 */

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: "Too many accounts created from this location. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: "Too many password reset requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Found during the Phase 14 audit: resume upload had no limit at all.
 * Document Intelligence is billed per page — an unthrottled endpoint here
 * isn't just a brute-force risk, it's a real cost/quota risk (the F0 tier
 * caps out at 500 pages/month). Keyed by the authenticated user's ID
 * rather than IP, since this route always requires a logged-in candidate.
 */
const resumeUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: "Too many resume uploads. Please try again in an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Also found during the audit: changing a password (which requires
 * re-entering the current one) had no throttling — a stolen/valid JWT
 * could otherwise be used to brute-force the current password with
 * unlimited attempts.
 */
const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: "Too many password change attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, registerLimiter, forgotPasswordLimiter, resumeUploadLimiter, passwordChangeLimiter };

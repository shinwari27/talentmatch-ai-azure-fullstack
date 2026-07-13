const { trackException } = require("../utils/telemetry");

/**
 * Centralized error handler — every route wraps its logic in try/catch and
 * calls next(err), landing here. Keeps error-response shape consistent and
 * avoids leaking stack traces / internal details to the client in production.
 *
 * Explicitly tracked to Application Insights here because auto-collected
 * exception tracking only catches unhandled crashes — errors that are
 * caught in a try/catch and passed to next(err), like everything in this
 * app, never reach that automatic collection on their own.
 */
function errorHandler(err, req, res, next) {
  console.error(err);
  trackException(err, { path: req.originalUrl, method: req.method, status: String(err.status || 500) });

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Something went wrong. Please try again."
      : err.message;

  res.status(status).json({ error: message });
}

module.exports = { errorHandler };

/**
 * Auto-instrumentation (enabled in appInsights.js) already captures every
 * HTTP request and unhandled exception automatically. This helper is for
 * the layer above that — business events worth seeing in Analytics that
 * aren't just "a request happened," like "a resume was uploaded" or "an
 * application was submitted." Safe to call even when Application Insights
 * isn't configured (local dev) — it just becomes a no-op.
 */
function trackEvent(name, properties = {}) {
  try {
    const appInsights = require("applicationinsights");
    if (appInsights.defaultClient) {
      appInsights.defaultClient.trackEvent({ name, properties });
    }
  } catch {
    // applicationinsights not installed/initialized — fine, this is best-effort telemetry, never business-critical
  }
}

function trackException(error, properties = {}) {
  try {
    const appInsights = require("applicationinsights");
    if (appInsights.defaultClient) {
      appInsights.defaultClient.trackException({ exception: error, properties });
    }
  } catch {
    // same as above — telemetry failures should never affect the actual request
  }
}

module.exports = { trackEvent, trackException };

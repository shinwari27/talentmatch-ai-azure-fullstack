/**
 * When Application Insights is enabled on the App Service via the Portal
 * toggle (Phase 15), Azure automatically injects
 * APPLICATIONINSIGHTS_CONNECTION_STRING as an app setting — no manual
 * secret handling needed for the deployed environment. Locally, this
 * variable won't exist, so initialization is skipped gracefully rather
 * than crashing local development.
 *
 * This must be required and started before any other module in the app —
 * that's an SDK requirement, not a stylistic choice, since it needs to
 * patch Node's HTTP/DB modules before they're used elsewhere.
 */
function initializeAppInsights() {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    console.log("Application Insights not configured (no connection string) — running without it.");
    return null;
  }

  const appInsights = require("applicationinsights");
  appInsights
    .setup(connectionString)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setSendLiveMetrics(false)
    .start();

  console.log("Application Insights initialized.");
  return appInsights.defaultClient;
}

module.exports = { initializeAppInsights };

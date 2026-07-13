require("dotenv").config();

// Must run before requiring anything else — the SDK patches Node's HTTP
// and database modules to auto-collect telemetry, which only works if
// it's initialized before those modules are first loaded elsewhere.
const { initializeAppInsights } = require("./src/config/appInsights");
initializeAppInsights();

const app = require("./src/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TalentMatch AI backend running on http://localhost:${PORT}`);
});

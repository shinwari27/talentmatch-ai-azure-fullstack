/**
 * Maps a numeric confidence (0-100) to a plain-language band. Dictionary
 * matches (skills/certifications/languages) use a fixed high score, so
 * they'll always land in "High" — that's expected and correct, not a bug.
 * Education and Experience scores genuinely vary, so this label carries
 * real signal for those two.
 */
function toConfidenceLabel(score) {
  if (score == null) return null;
  if (score >= 80) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

module.exports = { toConfidenceLabel };

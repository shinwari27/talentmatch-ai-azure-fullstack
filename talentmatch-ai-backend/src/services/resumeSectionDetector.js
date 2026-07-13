/**
 * Splits raw resume text into rough sections by detecting common header
 * lines (case-insensitive, must be short and on their own line — the
 * signature of an actual heading rather than a sentence that happens to
 * contain the word). This is still heuristic, not layout-aware — resumes
 * using tables, columns, or unconventional headers will fall back to
 * "unsectioned", which the extractor treats as "search the whole document."
 * It's a real accuracy improvement over scanning the whole document for
 * every category regardless of context, but it is not perfect section
 * parsing.
 */

const SECTION_HEADERS = {
  education: ["education", "academic background", "academic qualifications", "education & certifications", "education and certifications"],
  experience: ["experience", "work experience", "employment history", "professional experience", "work history"],
  skills: ["skills", "technical skills", "core competencies", "key skills"],
  certifications: ["certifications", "certificates", "licenses"],
  languages: ["languages", "language proficiency"],
  projects: ["projects", "personal projects", "key projects", "technical projects", "notable projects"],
};

function isLikelyHeaderLine(line) {
  const trimmed = line.trim();
  // A heading is short and doesn't end in punctuation like a sentence would
  return trimmed.length > 0 && trimmed.length <= 40 && !/[.,:;]$/.test(trimmed);
}

function matchSectionName(line) {
  const normalized = line.trim().toLowerCase();
  for (const [section, headers] of Object.entries(SECTION_HEADERS)) {
    if (headers.some((h) => normalized === h || normalized.startsWith(h))) {
      return section;
    }
  }
  return null;
}

function detectSections(fullText) {
  const lines = fullText.split("\n");
  const sections = { education: "", experience: "", skills: "", certifications: "", languages: "", projects: "", unsectioned: "" };

  let currentSection = "unsectioned";

  for (const line of lines) {
    if (isLikelyHeaderLine(line)) {
      const matched = matchSectionName(line);
      if (matched) {
        currentSection = matched;
        continue; // don't include the header line itself in the section body
      }
    }
    sections[currentSection] += line + "\n";
  }

  return sections;
}

module.exports = { detectSections };

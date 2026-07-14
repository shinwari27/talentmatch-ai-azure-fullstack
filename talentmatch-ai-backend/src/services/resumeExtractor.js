/**
 * IMPORTANT — read this before trusting any output from this file.
 *
 * This is deterministic pattern matching (dictionaries + regex) run against
 * text that resumeSectionDetector.js has already split into rough sections.
 * It is NOT a machine learning model. Confidence numbers below fall into
 * two genuinely different categories — don't read them as the same kind
 * of number:
 *
 *  - Skills / Certifications / Languages: matched against a fixed
 *    dictionary. A match is binary (the term is in the text, or it isn't) —
 *    there is no real gradient of certainty to report, so these get a FLAT
 *    constant confidence (DICTIONARY_MATCH_CONFIDENCE) rather than a
 *    fabricated varying number that would misrepresent certainty that
 *    doesn't exist.
 *  - Education / Experience: genuinely variable confidence, computed from
 *    how much of the expected structure was actually found (a section
 *    header, a clear institution/company name, a parseable date range).
 *    These numbers mean something different resume to resume.
 */

const { detectSections } = require("./resumeSectionDetector");

const DICTIONARY_MATCH_CONFIDENCE = 95;

const KNOWN_SKILLS = [
  // Web/software development
  "React", "Angular", "Vue", "JavaScript", "TypeScript", "Node.js", "Express",
  "Python", "Django", "Flask", "Java", "Spring", "C#", ".NET", "PHP", "Laravel",
  "HTML", "CSS", "Tailwind CSS", "SASS", "Bootstrap",
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "T-SQL",
  "REST APIs", "GraphQL", "Microservices",

  // Cloud platforms
  "Azure", "AWS", "Google Cloud", "GCP", "Docker", "Kubernetes", "Terraform", "Bicep",
  "ARM Templates", "Azure CLI", "CI/CD", "Git", "GitHub", "GitHub Actions", "Jenkins", "DevOps",

  // Azure-specific administration (previously missing — the gap that caused this)
  "Entra ID", "Azure AD", "Azure Active Directory", "Azure Monitor", "Azure Backup",
  "Azure Site Recovery", "Log Analytics", "Application Insights", "Conditional Access",
  "Virtual Machines", "Virtual Networks", "Storage Accounts", "Key Vault",

  // IT support / systems administration
  "Windows Server", "Active Directory", "Group Policy", "DNS", "DHCP", "RBAC",
  "PowerShell", "Networking", "Cisco", "CCNA", "CCNP", "Firewalls", "VPN",
  "Tier 1 Support", "Tier 2 Support", "Help Desk", "Ticketing", "Incident Management",
  "Microsoft 365", "M365", "Office 365", "SCCM", "Intune",

  // Data / analytics
  "Power BI", "Excel", "Data Analysis", "Machine Learning", "Artificial Intelligence",

  // Project / process
  "Project Management", "Agile", "Scrum", "Jira", "ITIL", "SOP Documentation",
];

const KNOWN_CERTIFICATIONS = [
  "AZ-104", "AZ-204", "AZ-305", "AZ-900", "MD-102", "MS-900", "SC-900",
  "CCNA", "CCNP", "CCIE",
  "PMP", "CAPM", "CISSP", "CompTIA A+", "CompTIA Network+", "CompTIA Security+",
  "AWS Certified Solutions Architect", "AWS Certified Developer",
  "Google Cloud Professional", "Terraform Associate", "Scrum Master", "PSM",
];

const KNOWN_LANGUAGES = [
  "English", "French", "Spanish", "German", "Urdu", "Pashto", "Punjabi", "Hindi",
  "Arabic", "Farsi", "Persian", "Mandarin", "Chinese", "Cantonese", "Japanese",
  "Korean", "Russian", "Portuguese", "Italian", "Turkish", "Bengali",
];

const DEGREE_KEYWORDS = [
  "Bachelor", "Bachelor's", "BSc", "B.Sc", "BS", "B.S.",
  "Master", "Master's", "MSc", "M.Sc", "MS", "M.S.", "MBA",
  "PhD", "Ph.D", "Doctorate",
  "Postgraduate", "Diploma", "Associate Degree", "Certificate",
];

const COMPANY_INDICATOR_PATTERN = /\b(Inc\.?|LLC|Ltd\.?|Technologies|Solutions|Corp\.?|Systems|Group|Company)\b/i;
const DATE_RANGE_PATTERN =
  /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4})\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{4}|Present|Current)/i;

function matchKnownTerms(text, dictionary) {
  const found = new Set();
  for (const term of dictionary) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, "i");
    if (pattern.test(text)) found.add(term);
  }
  return [...found];
}

function withDictionaryConfidence(names) {
  return names.map((name) => ({ name, confidence: DICTIONARY_MATCH_CONFIDENCE }));
}

function extractEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

function extractPhone(text) {
  const match = text.match(/(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  return match ? match[0].trim() : null;
}

function extractLinkedIn(text) {
  const match = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_%]+/i);
  return match ? (match[0].startsWith("http") ? match[0] : `https://${match[0]}`) : null;
}

function extractGithub(text) {
  const match = text.match(/(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9\-_%]+/i);
  return match ? (match[0].startsWith("http") ? match[0] : `https://${match[0]}`) : null;
}

/**
 * Education confidence, built from three independent signals:
 *  - Was this found inside a detected "Education" section (+30) or only
 *    via a whole-document fallback scan (+10)?
 *  - Is there a degree keyword match at all (+30 — this is required just
 *    to be considered a candidate row, so it's always true here)?
 *  - Did we find something that looks like a real institution name,
 *    rather than falling back to a placeholder (+40)?
 */
function extractEducation(sections) {
  const inSection = sections.education.trim().length > 0;
  const searchText = inSection ? sections.education : sections.unsectioned;
  const sectionBonus = inSection ? 30 : 10;

  const lines = searchText.split("\n").map((l) => l.trim()).filter(Boolean);
  const results = [];

  lines.forEach((line, i) => {
    const hasDegree = DEGREE_KEYWORDS.some((kw) => line.toLowerCase().includes(kw.toLowerCase()));
    if (!hasDegree) return;

    const nearbyLines = [line, lines[i + 1] || ""].join(" ");
    const institutionMatch = nearbyLines.match(/[A-Z][A-Za-z&.,'\s]*(University|College|Institute)[A-Za-z\s]*/);
    const institutionFound = !!institutionMatch;

    const confidence = Math.min(sectionBonus + 30 + (institutionFound ? 40 : 0), 100);

    results.push({
      degree: line,
      institution: institutionFound ? institutionMatch[0].trim() : null,
      confidence,
    });
  });

  const seen = new Set();
  return results.filter((r) => {
    const key = r.degree.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Experience confidence, built from:
 *  - Found inside a detected "Experience" section (+20) vs whole-document
 *    fallback (+5)
 *  - A clear date range was matched at all (+30 — required to be
 *    considered a row here, so always true)
 *  - A company-like indicator word was found nearby, e.g. "Inc", "Ltd",
 *    "Technologies" (+30) — this is what the job-title/company split
 *    leans on, so its presence meaningfully raises confidence in that split
 *  - A title/company split was possible at all vs. just a raw line (+20)
 */
const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/**
 * Converts one side of a date range ("Jan 2022", "2022", "January 2022")
 * into an ISO date string (YYYY-MM-DD), defaulting to the 1st of the month
 * since resumes never specify a day. Returns null for anything unparseable
 * — the caller treats that as "unknown," not as an error.
 */
function parseDatePart(text) {
  if (!text) return null;
  const trimmed = text.trim();

  const monthYearMatch = trimmed.match(/([A-Za-z]{3,})\.?\s*(\d{4})/);
  if (monthYearMatch) {
    const month = MONTH_MAP[monthYearMatch[1].slice(0, 3).toLowerCase()];
    const year = Number(monthYearMatch[2]);
    if (month !== undefined) return new Date(year, month, 1).toISOString().slice(0, 10);
  }

  const yearOnlyMatch = trimmed.match(/(\d{4})/);
  if (yearOnlyMatch) return new Date(Number(yearOnlyMatch[1]), 0, 1).toISOString().slice(0, 10);

  return null;
}

/**
 * Pulls the actual start/end dates out of a line already known to contain
 * a date range (via DATE_RANGE_PATTERN). "Present"/"Current" becomes a
 * null EndDate — an explicit "still ongoing," not a missing value — which
 * the matching engine already treats as "use today's date" when
 * calculating years of experience.
 */
function parseExperienceDateRange(line) {
  const match = line.match(DATE_RANGE_PATTERN);
  if (!match) return { startDate: null, endDate: null };

  const startDate = parseDatePart(match[1]);
  const endDate = /present|current/i.test(match[2]) ? null : parseDatePart(match[2]);
  return { startDate, endDate };
}

function extractExperience(sections) {
  const inSection = sections.experience.trim().length > 0;
  const searchText = inSection ? sections.experience : sections.unsectioned;
  const sectionBonus = inSection ? 20 : 5;

  const lines = searchText.split("\n").map((l) => l.trim()).filter(Boolean);
  const results = [];

  lines.forEach((line, i) => {
    if (!DATE_RANGE_PATTERN.test(line)) return;

    // A common resume convention (used in this exact test resume): the
    // date range sits ALONE on its own line, with the title+company combo
    // on the line directly above it. If the date shares its line with
    // other text instead, that line itself holds the title/company. This
    // distinction matters — treating the date-only line as if it also
    // contained the title/company (the original bug) produced garbage
    // like "Not detected — please edit at Not detected — please edit".
    const dateOnlyLine = line.replace(DATE_RANGE_PATTERN, "").trim().length === 0;
    const titleCompanyLine = dateOnlyLine ? lines[i - 1] || "" : line;

    const hasCompanyIndicator = COMPANY_INDICATOR_PATTERN.test(titleCompanyLine);
    // Recognizes "Title — Company", "Title – Company", "Title, Company",
    // "Title at Company" — em-dash and en-dash included, since those are
    // extremely common in resume formatting and were previously missing.
    const sameLineSplit = titleCompanyLine.match(/^(.+?)\s*(?:at|@|,|-|–|—)\s*(.+)$/i);

    let jobTitle = null;
    let companyName = null;
    let splitPossible = false;

    if (sameLineSplit) {
      jobTitle = sameLineSplit[1].trim();
      companyName = sameLineSplit[2].trim();
      splitPossible = true;
    } else if (titleCompanyLine) {
      jobTitle = titleCompanyLine;
      companyName = "Not detected — please edit";
      splitPossible = true;
    }

    const confidence = Math.min(
      sectionBonus + 30 + (hasCompanyIndicator ? 30 : 0) + (splitPossible ? 20 : 0),
      100
    );

    const { startDate, endDate } = parseExperienceDateRange(line);

    results.push({
      jobTitle: jobTitle || "Not detected — please edit",
      companyName: companyName || "Not detected — please edit",
      rawLine: line,
      confidence,
      startDate,
      endDate,
    });
  });

  return results;
}

/**
 * Never previously built — Projects were scored by the matching engine but
 * never actually extracted from a resume, only addable manually. This is a
 * best-effort heuristic: within the detected Projects section, a short
 * line with no bullet marker is treated as a project title; bullet-point
 * lines beneath it are treated as its description, until the next
 * title-like line starts a new project.
 */
function extractProjects(sections) {
  const searchText = sections.projects;
  if (!searchText || !searchText.trim()) return [];

  const lines = searchText.split("\n").map((l) => l.trim()).filter(Boolean);
  const projects = [];
  let current = null;

  for (const line of lines) {
    const isBulletLine = /^[•\-*]/.test(line);
    const looksLikeTitle = !isBulletLine && line.length <= 100;

    if (looksLikeTitle) {
      if (current) projects.push(current);
      current = { title: line, descriptionLines: [] };
    } else if (current) {
      current.descriptionLines.push(line.replace(/^[•\-*]\s*/, ""));
    }
  }
  if (current) projects.push(current);

  return projects.map((p) => ({
    title: p.title.slice(0, 200),
    description: p.descriptionLines.join(" ").slice(0, 2000),
  }));
}

function extractStructuredData(fullText) {
  const sections = detectSections(fullText);

  // Skills/certifications/languages are matched against their own detected
  // section first when one exists (reduces false positives from mentions
  // elsewhere in the document, e.g. a skill name appearing inside a project
  // description), falling back to the whole document otherwise.
  const skillsText = sections.skills.trim() ? sections.skills : fullText;
  const certsText = sections.certifications.trim() ? sections.certifications : fullText;
  const langsText = sections.languages.trim() ? sections.languages : fullText;

  return {
    email: extractEmail(fullText),
    phone: extractPhone(fullText),
    linkedInUrl: extractLinkedIn(fullText),
    githubUrl: extractGithub(fullText),
    skills: withDictionaryConfidence(matchKnownTerms(skillsText, KNOWN_SKILLS)),
    certifications: withDictionaryConfidence(matchKnownTerms(certsText, KNOWN_CERTIFICATIONS)),
    languages: withDictionaryConfidence(matchKnownTerms(langsText, KNOWN_LANGUAGES)),
    education: extractEducation(sections),
    experience: extractExperience(sections),
    projects: extractProjects(sections),
  };
}

module.exports = { extractStructuredData };

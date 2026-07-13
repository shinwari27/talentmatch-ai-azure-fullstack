/**
 * The core scoring algorithm for TalentMatch AI's matching engine.
 *
 * Deliberately pure functions with no database access — everything needed
 * is passed in already assembled. This makes the actual scoring logic easy
 * to reason about (and test) independent of how the data got fetched.
 *
 * WEIGHTS — approved design:
 *   Skills 40%, Experience 25%, Education 10%, Certifications 10%,
 *   Projects 10%, Languages 5%
 *
 * GRACEFUL REDISTRIBUTION — if a job doesn't specify requirements for a
 * category (e.g. no preferred languages), that category is excluded
 * entirely and its weight is redistributed proportionally across the
 * categories that DO apply, rather than counting it as a 0 or ignoring the
 * weight (which would make scores incomparable across jobs with different
 * numbers of specified categories).
 *
 * HONESTY NOTE: Experience and Education scoring only count Experience/
 * Education entries with VerificationStatus = 'Verified'. Entries still
 * "Pending Review" from AI resume parsing are NOT trusted for scoring —
 * this is the same principle applied throughout the resume parser: don't
 * treat an unverified guess as a fact. A candidate whose real experience
 * sits unverified will score lower here than their actual background
 * deserves, until they verify it. That's a deliberate tradeoff, not a bug.
 */

const BASE_WEIGHTS = {
  skills: 40,
  experience: 25,
  education: 10,
  certifications: 10,
  projects: 10,
  languages: 5,
};

const DEGREE_LEVELS = [
  { level: 1, keywords: ["diploma", "certificate"] },
  { level: 2, keywords: ["associate"] },
  { level: 3, keywords: ["bachelor", "bsc", "b.sc", "bs", "b.s."] },
  { level: 4, keywords: ["master", "msc", "m.sc", "ms", "m.s.", "mba"] },
  { level: 5, keywords: ["phd", "ph.d", "doctorate"] },
];

function degreeLevel(text) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  let highest = 0;
  for (const { level, keywords } of DEGREE_LEVELS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      highest = Math.max(highest, level);
    }
  }
  return highest;
}

function wordOverlap(textA, textB) {
  if (!textA || !textB) return 0;
  const stopWords = new Set(["in", "of", "or", "and", "the", "a", "degree", "related", "field", "with"]);
  const wordsA = new Set(textA.toLowerCase().split(/\W+/).filter((w) => w.length > 2 && !stopWords.has(w)));
  const wordsB = new Set(textB.toLowerCase().split(/\W+/).filter((w) => w.length > 2 && !stopWords.has(w)));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let matches = 0;
  for (const w of wordsA) if (wordsB.has(w)) matches++;
  return matches / wordsA.size; // proportion of the job's field-words the candidate's field also mentions
}

/**
 * Parses free-text like "3-5 yrs", "5+ years", "4-6 yrs" into a
 * { min, max } range. Falls back gracefully — a single number becomes
 * min=max=that number; "5+" becomes min=5 with a soft ceiling.
 */
function parseExperienceRange(text) {
  if (!text) return null;
  const rangeMatch = text.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };

  const plusMatch = text.match(/(\d+)\s*\+/);
  if (plusMatch) {
    const min = Number(plusMatch[1]);
    return { min, max: min + 3 }; // soft ceiling so "5+" doesn't require an arbitrary huge number to hit 100%
  }

  const singleMatch = text.match(/(\d+)/);
  if (singleMatch) {
    const n = Number(singleMatch[1]);
    return { min: n, max: n };
  }

  return null;
}

function calculateYearsOfExperience(verifiedExperiences) {
  let totalMonths = 0;
  for (const exp of verifiedExperiences) {
    if (!exp.StartDate) continue;
    const start = new Date(exp.StartDate);
    const end = exp.EndDate ? new Date(exp.EndDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  }
  return totalMonths / 12;
}

function scoreSkillsLikeCategory(requiredNames, candidateNames) {
  if (!requiredNames || requiredNames.length === 0) return null; // doesn't apply
  const candidateSet = new Set(candidateNames.map((n) => n.toLowerCase()));
  const matched = requiredNames.filter((n) => candidateSet.has(n.toLowerCase()));
  const missing = requiredNames.filter((n) => !candidateSet.has(n.toLowerCase()));
  const score = Math.round((matched.length / requiredNames.length) * 100);
  return { score, matched, missing };
}

function scoreExperience(job, verifiedExperiences) {
  const range = parseExperienceRange(job.ExperienceRequired);
  if (!range) return null; // job didn't specify a parseable requirement

  const candidateYears = calculateYearsOfExperience(verifiedExperiences);

  let score;
  if (candidateYears >= range.max) {
    score = 100;
  } else if (candidateYears >= range.min) {
    const span = range.max - range.min;
    const progress = span > 0 ? (candidateYears - range.min) / span : 1;
    score = Math.round(80 + progress * 20);
  } else {
    score = range.min > 0 ? Math.max(0, Math.round((candidateYears / range.min) * 80)) : 100;
  }

  return { score, candidateYears: Math.round(candidateYears * 10) / 10, requiredRange: range };
}

function scoreEducation(job, verifiedEducations) {
  if (!job.EducationRequirement) return null; // job didn't specify

  const requiredLevel = degreeLevel(job.EducationRequirement);
  const candidateLevels = verifiedEducations.map((e) => degreeLevel(e.Degree));
  const candidateBestLevel = candidateLevels.length ? Math.max(...candidateLevels) : 0;
  const candidateBestEducation = verifiedEducations.find((e) => degreeLevel(e.Degree) === candidateBestLevel);

  let levelScore;
  if (requiredLevel === 0) {
    levelScore = 60; // job mentioned education but no clear degree level — give benefit of the doubt on this component
  } else if (candidateBestLevel >= requiredLevel) {
    levelScore = 60;
  } else if (candidateBestLevel > 0) {
    levelScore = Math.round((candidateBestLevel / requiredLevel) * 60);
  } else {
    levelScore = 0;
  }

  const fieldOverlapRatio = candidateBestEducation
    ? wordOverlap(job.EducationRequirement, candidateBestEducation.FieldOfStudy || candidateBestEducation.Degree)
    : 0;
  const fieldScore = Math.round(fieldOverlapRatio * 40);

  return { score: Math.min(100, levelScore + fieldScore), candidateBestLevel, requiredLevel };
}

function scoreProjects(requiredSkillNames, projects) {
  if (!requiredSkillNames || requiredSkillNames.length === 0) return null; // nothing to compare against
  if (!projects || projects.length === 0) return { score: 0, mentionedSkills: [] };

  const combinedText = projects.map((p) => `${p.Title} ${p.Description || ""}`).join(" ").toLowerCase();
  const mentioned = requiredSkillNames.filter((skill) => combinedText.includes(skill.toLowerCase()));
  const score = Math.round((mentioned.length / requiredSkillNames.length) * 100);

  return { score, mentionedSkills: mentioned };
}

/**
 * Assembles the full match result: overall score, per-category breakdown
 * (only including categories that actually applied), missing skills, and
 * a plain-language reasons list a recruiter can read at a glance.
 */
function computeMatch({ job, candidateSkills, candidateCertifications, candidateLanguages, verifiedEducations, verifiedExperiences, projects }) {
  const jobSkillNames = job.skills?.map((s) => s.Name) || [];
  const jobCertNames = job.preferredCertifications?.map((c) => c.Name) || [];
  const jobLanguageNames = job.preferredLanguages?.map((l) => l.Name) || [];

  const candidateSkillNames = candidateSkills.map((s) => s.Name);
  const candidateCertNames = candidateCertifications.map((c) => c.Name);
  const candidateLanguageNames = candidateLanguages.map((l) => l.Name);

  const results = {
    skills: scoreSkillsLikeCategory(jobSkillNames, candidateSkillNames),
    experience: scoreExperience(job, verifiedExperiences),
    education: scoreEducation(job, verifiedEducations),
    certifications: scoreSkillsLikeCategory(jobCertNames, candidateCertNames),
    projects: scoreProjects(jobSkillNames, projects),
    languages: scoreSkillsLikeCategory(jobLanguageNames, candidateLanguageNames),
  };

  // Only categories that actually produced a result count toward the
  // score — this is the "graceful redistribution" behavior: a job with no
  // language preference doesn't get languages scored as 0, it just isn't
  // part of the calculation, and everything else scales up to fill 100%.
  const applicableCategories = Object.entries(results).filter(([, r]) => r !== null);
  const totalApplicableWeight = applicableCategories.reduce((sum, [cat]) => sum + BASE_WEIGHTS[cat], 0);

  let overallScore = 0;
  const breakdown = [];

  for (const [category, result] of applicableCategories) {
    const normalizedWeight = totalApplicableWeight > 0 ? (BASE_WEIGHTS[category] / totalApplicableWeight) * 100 : 0;
    const weightedContribution = (result.score * normalizedWeight) / 100;
    overallScore += weightedContribution;

    breakdown.push({
      category,
      weightPercent: Math.round(normalizedWeight),
      score: result.score,
      weightedContribution: Math.round(weightedContribution * 10) / 10,
    });
  }

  const reasons = [];
  if (results.skills) {
    results.skills.matched.forEach((s) => reasons.push({ met: true, label: s }));
    results.skills.missing.forEach((s) => reasons.push({ met: false, label: s }));
  }
  if (results.certifications) {
    results.certifications.matched.forEach((c) => reasons.push({ met: true, label: c }));
    results.certifications.missing.forEach((c) => reasons.push({ met: false, label: c }));
  }
  if (results.experience) {
    const { candidateYears, requiredRange } = results.experience;
    reasons.push({
      met: candidateYears >= requiredRange.min,
      label: `${candidateYears} yrs experience (job asks for ${requiredRange.min}-${requiredRange.max})`,
    });
  }

  return {
    overallScore: Math.round(overallScore),
    breakdown,
    missingSkills: results.skills?.missing || [],
    missingCertifications: results.certifications?.missing || [],
    reasons,
  };
}

module.exports = { computeMatch, parseExperienceRange, degreeLevel, calculateYearsOfExperience };

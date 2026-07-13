const {
  computeMatch,
  parseExperienceRange,
  degreeLevel,
  calculateYearsOfExperience,
} = require("../../src/services/matchingEngine");

describe("parseExperienceRange", () => {
  test("parses a standard range like '3-5 yrs'", () => {
    expect(parseExperienceRange("3-5 yrs")).toEqual({ min: 3, max: 5 });
  });

  test("parses a plus-style range like '5+ years'", () => {
    expect(parseExperienceRange("5+ years")).toEqual({ min: 5, max: 8 });
  });

  test("parses a single number as both min and max", () => {
    expect(parseExperienceRange("3")).toEqual({ min: 3, max: 3 });
  });

  test("returns null for unparseable text", () => {
    expect(parseExperienceRange("")).toBeNull();
    expect(parseExperienceRange(null)).toBeNull();
  });
});

describe("degreeLevel", () => {
  test("recognizes Bachelor's as level 3", () => {
    expect(degreeLevel("Bachelor's in Computer Science")).toBe(3);
  });

  test("recognizes Master's as level 4", () => {
    expect(degreeLevel("Master of Business Administration")).toBe(4);
  });

  test("recognizes Diploma as level 1", () => {
    expect(degreeLevel("Diploma in IT")).toBe(1);
  });

  test("returns 0 when no recognizable degree keyword is present", () => {
    expect(degreeLevel("Some unrelated text")).toBe(0);
  });

  test("returns 0 for empty input", () => {
    expect(degreeLevel("")).toBe(0);
    expect(degreeLevel(null)).toBe(0);
  });
});

describe("calculateYearsOfExperience", () => {
  test("calculates years between a start date and an explicit end date", () => {
    const experiences = [{ StartDate: "2020-01-01", EndDate: "2023-01-01" }];
    expect(calculateYearsOfExperience(experiences)).toBeCloseTo(3, 0);
  });

  test("treats a null EndDate as ongoing (uses today's date)", () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const experiences = [{ StartDate: twoYearsAgo.toISOString().slice(0, 10), EndDate: null }];
    expect(calculateYearsOfExperience(experiences)).toBeCloseTo(2, 0);
  });

  test("skips entries with no StartDate entirely", () => {
    const experiences = [{ StartDate: null, EndDate: "2023-01-01" }];
    expect(calculateYearsOfExperience(experiences)).toBe(0);
  });

  test("sums multiple experience entries", () => {
    const experiences = [
      { StartDate: "2018-01-01", EndDate: "2020-01-01" }, // 2 years
      { StartDate: "2020-01-01", EndDate: "2022-01-01" }, // 2 years
    ];
    expect(calculateYearsOfExperience(experiences)).toBeCloseTo(4, 0);
  });
});

describe("computeMatch", () => {
  const baseJob = {
    ExperienceRequired: "2-4 yrs",
    EducationRequirement: "Bachelor's in Computer Science",
    skills: [{ Name: "React" }, { Name: "TypeScript" }, { Name: "Azure" }],
    preferredCertifications: [],
    preferredLanguages: [],
  };

  test("scores a strong match highly across skills, experience, and education", () => {
    const result = computeMatch({
      job: baseJob,
      candidateSkills: [{ Name: "React" }, { Name: "TypeScript" }, { Name: "Azure" }],
      candidateCertifications: [],
      candidateLanguages: [],
      verifiedEducations: [{ Degree: "Bachelor of Computer Science", FieldOfStudy: "Computer Science" }],
      verifiedExperiences: [{ StartDate: "2021-01-01", EndDate: null }],
      projects: [],
    });

    expect(result.overallScore).toBeGreaterThan(70);
    expect(result.missingSkills).toEqual([]);
  });

  test("identifies missing skills correctly", () => {
    const result = computeMatch({
      job: baseJob,
      candidateSkills: [{ Name: "React" }], // missing TypeScript and Azure
      candidateCertifications: [],
      candidateLanguages: [],
      verifiedEducations: [],
      verifiedExperiences: [],
      projects: [],
    });

    expect(result.missingSkills).toEqual(expect.arrayContaining(["TypeScript", "Azure"]));
  });

  test("excludes categories the job didn't specify, rather than scoring them as 0", () => {
    const jobWithNoCerts = { ...baseJob, preferredCertifications: [], preferredLanguages: [] };
    const result = computeMatch({
      job: jobWithNoCerts,
      candidateSkills: [{ Name: "React" }],
      candidateCertifications: [],
      candidateLanguages: [],
      verifiedEducations: [],
      verifiedExperiences: [],
      projects: [],
    });

    const scoredCategories = result.breakdown.map((b) => b.category);
    expect(scoredCategories).not.toContain("certifications");
    expect(scoredCategories).not.toContain("languages");
  });

  test("a candidate with nothing in common scores 0, not a negative number or NaN", () => {
    const result = computeMatch({
      job: baseJob,
      candidateSkills: [],
      candidateCertifications: [],
      candidateLanguages: [],
      verifiedEducations: [],
      verifiedExperiences: [],
      projects: [],
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(Number.isNaN(result.overallScore)).toBe(false);
  });
});

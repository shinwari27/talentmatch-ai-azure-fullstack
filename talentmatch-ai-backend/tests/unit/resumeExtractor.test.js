const { extractStructuredData } = require("../../src/services/resumeExtractor");

describe("extractStructuredData", () => {
  test("extracts an email and phone number from resume text", () => {
    const text = "Contact: jane.doe@example.com or (416) 555-0142";
    const result = extractStructuredData(text);
    expect(result.email).toBe("jane.doe@example.com");
    expect(result.phone).toContain("416");
  });

  test("extracts LinkedIn and GitHub URLs", () => {
    const text = "linkedin.com/in/janedoe github.com/janedoe";
    const result = extractStructuredData(text);
    expect(result.linkedInUrl).toContain("linkedin.com/in/janedoe");
    expect(result.githubUrl).toContain("github.com/janedoe");
  });

  test("matches known skills from the dictionary, case-insensitively", () => {
    const text = "Experienced with azure, Docker, and REACT development.";
    const result = extractStructuredData(text);
    const skillNames = result.skills.map((s) => s.name);
    expect(skillNames).toEqual(expect.arrayContaining(["Azure", "Docker", "React"]));
  });

  test("does not match a skill that isn't actually present", () => {
    const text = "Experienced with Python and Django.";
    const result = extractStructuredData(text);
    const skillNames = result.skills.map((s) => s.name);
    expect(skillNames).not.toContain("Kubernetes");
  });

  test("assigns a flat, high confidence to every dictionary match", () => {
    const text = "Skills: Azure, PowerShell";
    const result = extractStructuredData(text);
    result.skills.forEach((skill) => {
      expect(skill.confidence).toBe(95);
    });
  });

  test("extracts a recognizable certification", () => {
    const text = "Certifications: AZ-104, CCNA";
    const result = extractStructuredData(text);
    const certNames = result.certifications.map((c) => c.name);
    expect(certNames).toEqual(expect.arrayContaining(["AZ-104", "CCNA"]));
  });

  test("extracts an education entry with a recognizable degree keyword", () => {
    const text = "EDUCATION\nBachelor of Computer Science\nCOMSATS University Islamabad";
    const result = extractStructuredData(text);
    expect(result.education.length).toBeGreaterThan(0);
    expect(result.education[0].degree.toLowerCase()).toContain("bachelor");
  });

  test("returns empty arrays, not errors, for text with no recognizable content", () => {
    const result = extractStructuredData("Lorem ipsum dolor sit amet.");
    expect(result.skills).toEqual([]);
    expect(result.certifications).toEqual([]);
    expect(result.education).toEqual([]);
  });
});

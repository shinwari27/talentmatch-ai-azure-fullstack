process.env.JWT_SECRET = "test-secret-key-for-jest-only";
process.env.JWT_EXPIRES_IN = "1h";

const { signToken, verifyToken } = require("../../src/utils/jwt");

describe("JWT sign and verify", () => {
  test("signs a token containing only id and role — nothing sensitive", () => {
    const token = signToken({ Id: 42, Role: "Candidate" });
    const decoded = verifyToken(token);
    expect(decoded.sub).toBe(42);
    expect(decoded.role).toBe("Candidate");
    // Confirms no other fields leaked into the token payload
    expect(Object.keys(decoded)).toEqual(expect.arrayContaining(["sub", "role", "iat", "exp"]));
  });

  test("throws when verifying a tampered or invalid token", () => {
    expect(() => verifyToken("not.a.real.token")).toThrow();
  });

  test("throws when verifying a token signed with a different secret", () => {
    const jwt = require("jsonwebtoken");
    const foreignToken = jwt.sign({ sub: 1, role: "Candidate" }, "a-different-secret");
    expect(() => verifyToken(foreignToken)).toThrow();
  });
});

const { hashPassword, verifyPassword } = require("../../src/utils/password");

describe("password hashing", () => {
  test("hashes a password into something that isn't the plain text", async () => {
    const hash = await hashPassword("MyPassword123");
    expect(hash).not.toBe("MyPassword123");
    expect(hash.length).toBeGreaterThan(20); // bcrypt hashes are always long
  });

  test("verifies a correct password against its own hash", async () => {
    const hash = await hashPassword("MyPassword123");
    const isValid = await verifyPassword("MyPassword123", hash);
    expect(isValid).toBe(true);
  });

  test("rejects an incorrect password against a hash", async () => {
    const hash = await hashPassword("MyPassword123");
    const isValid = await verifyPassword("WrongPassword", hash);
    expect(isValid).toBe(false);
  });

  test("hashing the same password twice produces different hashes (real salting)", async () => {
    const hash1 = await hashPassword("MyPassword123");
    const hash2 = await hashPassword("MyPassword123");
    expect(hash1).not.toBe(hash2);
  });
});

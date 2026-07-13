process.env.JWT_SECRET = "test-secret-key-for-jest-only";
process.env.JWT_EXPIRES_IN = "1h";

jest.mock("../../src/models/userModel");
const userModel = require("../../src/models/userModel");
const authController = require("../../src/controllers/authController");
const { hashPassword } = require("../../src/utils/password");

/**
 * Builds a minimal fake Express response object — just enough for
 * controllers to call res.status(...).json(...) and for tests to inspect
 * what was sent, without needing a real HTTP server or supertest.
 */
function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("authController.register", () => {
  beforeEach(() => jest.clearAllMocks());

  test("rejects registration with an invalid role", async () => {
    const req = { body: { fullName: "Jane", email: "jane@test.com", password: "Pass1234", role: "Admin" } };
    const res = mockResponse();

    await authController.register(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("rejects a recruiter registration missing companyName", async () => {
    const req = { body: { fullName: "Jane", email: "jane@test.com", password: "Pass1234", role: "Recruiter" } };
    const res = mockResponse();

    await authController.register(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("rejects registration when the email already exists", async () => {
    userModel.findByEmail.mockResolvedValue({ Id: 1, Email: "jane@test.com" });
    const req = { body: { fullName: "Jane", email: "jane@test.com", password: "Pass1234", role: "Candidate" } };
    const res = mockResponse();

    await authController.register(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("creates a candidate account successfully on the happy path", async () => {
    userModel.findByEmail.mockResolvedValue(null);
    userModel.createUser.mockResolvedValue({ Id: 1, FullName: "Jane", Email: "jane@test.com", Role: "Candidate" });
    userModel.createCandidateProfile.mockResolvedValue({});

    const req = { body: { fullName: "Jane", email: "jane@test.com", password: "Pass1234", role: "Candidate" } };
    const res = mockResponse();

    await authController.register(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(userModel.createCandidateProfile).toHaveBeenCalledWith(1);
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.token).toBeDefined();
    expect(responseBody.user.email).toBe("jane@test.com");
  });
});

describe("authController.login", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns a generic 401 for a non-existent email (doesn't reveal the account doesn't exist)", async () => {
    userModel.findByEmail.mockResolvedValue(null);
    const req = { body: { email: "nobody@test.com", password: "whatever" } };
    const res = mockResponse();

    await authController.login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].error).toBe("Invalid email or password.");
  });

  test("returns the same generic 401 for a wrong password (doesn't reveal the email was correct)", async () => {
    const realHash = await hashPassword("CorrectPassword1");
    userModel.findByEmail.mockResolvedValue({
      Id: 1, Email: "jane@test.com", PasswordHash: realHash, Status: "Active", Role: "Candidate",
    });
    const req = { body: { email: "jane@test.com", password: "WrongPassword" } };
    const res = mockResponse();

    await authController.login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].error).toBe("Invalid email or password.");
  });

  test("blocks login for a suspended account with a clear message", async () => {
    const realHash = await hashPassword("CorrectPassword1");
    userModel.findByEmail.mockResolvedValue({
      Id: 1, Email: "jane@test.com", PasswordHash: realHash, Status: "Suspended", Role: "Candidate",
    });
    const req = { body: { email: "jane@test.com", password: "CorrectPassword1" } };
    const res = mockResponse();

    await authController.login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("logs in successfully with correct credentials on an active account", async () => {
    const realHash = await hashPassword("CorrectPassword1");
    userModel.findByEmail.mockResolvedValue({
      Id: 1, FullName: "Jane", Email: "jane@test.com", PasswordHash: realHash, Status: "Active", Role: "Candidate",
    });
    userModel.updateLastLogin.mockResolvedValue();

    const req = { body: { email: "jane@test.com", password: "CorrectPassword1" } };
    const res = mockResponse();

    await authController.login(req, res, jest.fn());

    expect(res.status).not.toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].token).toBeDefined();
  });
});

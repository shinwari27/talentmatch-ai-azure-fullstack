const userModel = require("../models/userModel");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");

const ALLOWED_SELF_REGISTER_ROLES = ["Candidate", "Recruiter"]; // Admins are provisioned manually, not self-registered

async function register(req, res, next) {
  try {
    const { fullName, email, password, role, companyName } = req.body;

    if (!ALLOWED_SELF_REGISTER_ROLES.includes(role)) {
      return res.status(400).json({ error: "Role must be either 'Candidate' or 'Recruiter'." });
    }
    if (role === "Recruiter" && !companyName) {
      return res.status(400).json({ error: "Company name is required for recruiter accounts." });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await hashPassword(password);
    const user = await userModel.createUser({ fullName, email, passwordHash, role });

    if (role === "Candidate") {
      await userModel.createCandidateProfile(user.Id);
    } else {
      await userModel.createRecruiterProfile(user.Id, companyName);
    }

    const token = signToken(user);

    res.status(201).json({
      token,
      user: { id: user.Id, fullName: user.FullName, email: user.Email, role: user.Role },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);
    // Deliberately identical error for "no such user" and "wrong password" —
    // distinguishing them lets an attacker enumerate valid emails.
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    if (user.Status === "Suspended") {
      return res.status(403).json({ error: "This account has been suspended. Contact an administrator." });
    }

    const passwordMatches = await verifyPassword(password, user.PasswordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    await userModel.updateLastLogin(user.Id);
    const token = signToken(user);

    res.json({
      token,
      user: { id: user.Id, fullName: user.FullName, email: user.Email, role: user.Role },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({
      id: user.Id,
      fullName: user.FullName,
      email: user.Email,
      role: user.Role,
      status: user.Status,
      createdAt: user.CreatedAt,
      lastLoginAt: user.LastLoginAt,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Stub for now, per the current phase's scope — no email service (ACS) is
 * wired up yet. This still validates the email exists and returns a generic
 * response either way, so the endpoint doesn't leak which emails are
 * registered. Real email sending gets wired in once ACS is provisioned.
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await userModel.findByEmail(email);

    if (user) {
      console.log(`[stub] Password reset requested for ${email} — no email sent yet (ACS not wired up).`);
    }

    res.json({ message: "If an account with that email exists, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
}

/**
 * JWTs are stateless — there's nothing to invalidate server-side without a
 * token blacklist (not implemented yet). This endpoint exists so the frontend
 * has a consistent call to make; the real logout action is the frontend
 * discarding its stored token.
 */
function logout(req, res) {
  res.json({ message: "Logged out." });
}

module.exports = { register, login, me, forgotPassword, logout };

const jwt = require("jsonwebtoken");

/**
 * The JWT payload intentionally carries only what authorization checks need
 * (id, role) — never the password hash or other sensitive fields. Anything
 * else the frontend needs about the user should come from a `/auth/me` call,
 * not be baked into the token.
 */
function signToken(user) {
  return jwt.sign(
    { sub: user.Id, role: user.Role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };

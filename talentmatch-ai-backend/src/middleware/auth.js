const { verifyToken } = require("../utils/jwt");

/**
 * Reads the Authorization header (`Bearer <token>`), verifies the JWT, and
 * attaches the decoded payload to `req.user`. Rejects with 401 if missing
 * or invalid — never silently continues as an anonymous user.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or malformed Authorization header." });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

/**
 * Use after requireAuth. Restricts a route to one or more roles, e.g.
 * `requireRole('Admin')` or `requireRole('Recruiter', 'Admin')`.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };

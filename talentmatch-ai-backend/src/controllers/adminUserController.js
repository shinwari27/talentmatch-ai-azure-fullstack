const adminUserModel = require("../models/adminUserModel");

async function listUsers(req, res, next) {
  try {
    const { role, search, page } = req.query;
    const result = await adminUserModel.listUsers({
      role,
      search,
      page: page ? parseInt(page, 10) : 1,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function setUserStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!["Active", "Suspended"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'Active' or 'Suspended'." });
    }

    // Prevent an admin from locking themselves out by suspending their own account.
    if (parseInt(req.params.id, 10) === req.user.id && status === "Suspended") {
      return res.status(400).json({ error: "You cannot suspend your own account." });
    }

    const user = await adminUserModel.setUserStatus(req.params.id, status);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, setUserStatus };

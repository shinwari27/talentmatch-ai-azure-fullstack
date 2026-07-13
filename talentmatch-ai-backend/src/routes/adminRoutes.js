const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const adminUserController = require("../controllers/adminUserController");

const router = express.Router();

router.use(requireAuth, requireRole("Admin"));

router.get("/users", adminUserController.listUsers);
router.patch("/users/:id/status", adminUserController.setUserStatus);

module.exports = router;

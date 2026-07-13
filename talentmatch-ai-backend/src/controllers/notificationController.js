const notificationModel = require("../models/notificationModel");

async function listMyNotifications(req, res, next) {
  try {
    const notifications = await notificationModel.listForUser(req.user.id);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

async function markOneRead(req, res, next) {
  try {
    const notification = await notificationModel.markRead(req.user.id, req.params.id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found." });
    }
    res.json(notification);
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await notificationModel.markAllRead(req.user.id);
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMyNotifications, markOneRead, markAllRead };

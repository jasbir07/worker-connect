const Notification = require("../models/Notification");

/* ======================
   GET USER NOTIFICATIONS
====================== */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

/* ======================
   MARK ONE AS READ
====================== */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    ).lean();

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Error updating notification" });
  }
};

/* ======================
   MARK ALL AS READ
====================== */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ message: "Error updating notifications" });
  }
};

/* ======================
   CREATE & EMIT NOTIFICATION (helper for other controllers)
   Call with: createAndEmitNotification(req, { userId, type, message, link })
====================== */
exports.createAndEmitNotification = async (req, { userId, type, message, link = "" }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      message,
      link
    });

    const io = req.app.get("io");
    if (io) {
      const roomId = userId.toString();
      io.to(roomId).emit("newNotification", {
        _id: notification._id,
        user: notification.user,
        type: notification.type,
        message: notification.message,
        link: notification.link,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (err) {
    console.error("createAndEmitNotification error:", err);
    return null;
  }
};

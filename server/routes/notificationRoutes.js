import express from "express";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Get current user's notifications
router.get(
  "/",
  protect,
  getNotifications
);

// Mark one notification as read
router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);

// Mark all notifications as read
router.put(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

export default router;
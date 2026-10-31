import express from "express";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import {
  getDashboardStats,
  getAllUsers,
  getAdminItems,
  deleteAdminItem,
  updateUserRole,
  getAdminMatches,
} from "../controllers/adminController.js";
import { getActivityLogs } from "../controllers/adminController.js";
const router = express.Router();

router.get("/dashboard", protect, admin, getDashboardStats);
router.get("/users", protect, admin, getAllUsers);
router.get("/items", protect, admin, getAdminItems);
router.delete("/items/:id", protect, admin, deleteAdminItem);
router.patch("/users/:id/role", protect, admin, updateUserRole);
router.get("/matches", protect, admin, getAdminMatches);
router.get("/activity-logs", protect, admin, getActivityLogs);

export default router;
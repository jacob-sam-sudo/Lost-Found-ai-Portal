import express from "express";

import {
  createOrGetChat,
  getMyChats,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
} from "../controllers/chatController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Create or get chat for a confirmed match
router.post("/", protect, createOrGetChat);

// Get all chats for logged-in user
router.get("/", protect, getMyChats);

// Get messages for a specific chat
router.get("/:id/messages", protect, getChatMessages);

// Send a message
router.post("/:id/messages", protect, sendMessage);

// Mark messages as read
router.put("/:id/read", protect, markMessagesAsRead);

export default router;
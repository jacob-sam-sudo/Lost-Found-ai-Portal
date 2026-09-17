import express from "express";

import {
  getMyMatches,
  confirmMatch,
  rejectMatch,
  returnMatch,
} from "../controllers/matchController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Get matches involving the logged-in user
router.get(
  "/",
  protect,
  getMyMatches
);

// Confirm a potential match
router.put(
  "/:id/confirm",
  protect,
  confirmMatch
);

// Reject a potential match
router.put(
  "/:id/reject",
  protect,
  rejectMatch
);
// Mark a confirmed match as returned
router.put(
  "/:id/return",
  protect,
  returnMatch
);
export default router;
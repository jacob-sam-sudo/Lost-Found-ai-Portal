import express from "express";

import {
  submitOwnershipClaim,
  getMyClaims,
  getReceivedClaims,
  reviewOwnershipClaim,
} from "../controllers/ownershipController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Submit an ownership claim
router.post("/:matchId", protect, submitOwnershipClaim);

// Get claims submitted by the logged-in user
router.get("/my-claims", protect, getMyClaims);

// Get claims received by the logged-in finder
router.get("/received", protect, getReceivedClaims);

// Finder approves or rejects a claim
router.patch("/:id/review", protect, reviewOwnershipClaim);

export default router;
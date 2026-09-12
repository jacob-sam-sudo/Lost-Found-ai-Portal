import express from "express";

import {
  testSimilarity,
  findMatches,
} from "../controllers/aiController.js";

const router = express.Router();

router.post(
  "/similarity",
  testSimilarity
);

router.get(
  "/matches/:id",
  findMatches
);

export default router;
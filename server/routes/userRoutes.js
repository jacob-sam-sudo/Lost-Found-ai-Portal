import express from "express";
import upload
from "../middleware/upload.js";

import {
uploadAvatar
}
from
"../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

import {
  getCurrentUser,updateProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protect, getCurrentUser);
router.put("/update", protect, updateProfile);
router.post(
"/avatar",
protect,
upload.single(
"avatar"
),
uploadAvatar
);

export default router;
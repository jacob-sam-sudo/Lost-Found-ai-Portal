import express from "express";

import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getMyItems,
} from "../controllers/itemController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();


// Public

router.get("/", getItems);

router.get(
  "/user/my-items",
  authMiddleware,
  getMyItems
);
router.get("/:id", getItemById);


// Protected

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  createItem
);



router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  updateItem
);

router.delete(
  "/:id",
  authMiddleware,
  deleteItem
);

export default router;
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    matchedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    similarity: {
      type: Number,
      required: true,
    },

    matchPercentage: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["match"],
      default: "match",
    },

    message: {
      type: String,
      default: "A potential match was found for your item.",
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;
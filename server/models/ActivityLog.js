
import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "ITEM_DELETED",
        "USER_PROMOTED",
        "USER_DEMOTED",
      ],
      required: true,
    },

    targetType: {
      type: String,
      enum: ["Item", "User"],
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    targetName: {
      type: String,
      required: true,
    },

    details: {
      type: String,
      default: "",
    },

    previousValue: {
      type: String,
      default: null,
    },

    newValue: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ActivityLog = mongoose.model(
  "ActivityLog",
  activityLogSchema
);

export default ActivityLog;

import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    foundItem: {
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

    status: {
  type: String,
  enum: [
    "potential",
    "confirmed",
    "rejected",
    "returned",
  ],
  default: "potential",
},
  },
  {
    timestamps: true,
  }
);

// Prevent the same Lost ↔ Found pair from being stored twice
matchSchema.index(
  {
    lostItem: 1,
    foundItem: 1,
  },
  {
    unique: true,
  }
);

const Match = mongoose.model(
  "Match",
  matchSchema
);

export default Match;

import mongoose from "mongoose";

const aiMatchSchema = new mongoose.Schema(
  {
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
  },
  {
    _id: false,
  }
);

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    status: {
  type: String,
  enum: ["lost", "found", "returned"],
  required: true,
},

    location: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    aiMatches: {
      type: [aiMatchSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;


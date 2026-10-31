import mongoose from "mongoose";

const ownershipClaimSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },

    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    finder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    answers: {
      physicalFeature: {
        type: String,
        required: true,
      },

      identifyingDetail: {
        type: String,
        required: true,
      },

      additionalInformation: {
        type: String,
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewNotes: {
      type: String,
      default: "",
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const OwnershipClaim = mongoose.model(
  "OwnershipClaim",
  ownershipClaimSchema
);

export default OwnershipClaim;
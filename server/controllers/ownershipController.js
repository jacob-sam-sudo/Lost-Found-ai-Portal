import mongoose from "mongoose";
import OwnershipClaim from "../models/OwnershipClaim.js";
import Match from "../models/Match.js";
import Notification from "../models/Notification.js";

// Submit an ownership claim
export const submitOwnershipClaim = async (req, res) => {
  try {
    const { matchId } = req.params;
    const {
      physicalFeature,
      identifyingDetail,
      additionalInformation,
    } = req.body;

    if (!mongoose.isValidObjectId(matchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid match ID.",
      });
    }

    if (
      !physicalFeature?.trim() ||
      !identifyingDetail?.trim() ||
      !additionalInformation?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please answer all three verification questions.",
      });
    }

    const match = await Match.findById(matchId)
      .populate("lostItem", "title owner")
      .populate("foundItem", "title owner");

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found.",
      });
    }

    if (match.status !== "potential") {
      return res.status(400).json({
        success: false,
        message: "This match is no longer available for ownership claims.",
      });
    }

    const claimantId = req.user._id.toString();
    const lostOwnerId = match.lostItem.owner.toString();
    const finderId = match.foundItem.owner.toString();

    // Only the owner of the lost item can claim the found item
    if (claimantId !== lostOwnerId) {
      return res.status(403).json({
        success: false,
        message: "Only the lost item's owner can submit this claim.",
      });
    }

    if (claimantId === finderId) {
      return res.status(400).json({
        success: false,
        message: "You cannot claim an item that you reported as found.",
      });
    }

    const existingClaim = await OwnershipClaim.findOne({
      match: match._id,
      claimant: claimantId,
      status: "pending",
    });

    if (existingClaim) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending claim for this match.",
      });
    }

    const claim = await OwnershipClaim.create({
      match: match._id,
      claimant: claimantId,
      finder: finderId,
      answers: {
        physicalFeature: physicalFeature.trim(),
        identifyingDetail: identifyingDetail.trim(),
        additionalInformation: additionalInformation.trim(),
      },
    });

    await Notification.create({
      recipient: finderId,
      item: match.foundItem._id,
      matchedItem: match.lostItem._id,
      similarity: match.similarity,
      matchPercentage: match.matchPercentage,
      type: "ownership_claim",
      message: `Someone has submitted an ownership claim for "${match.foundItem.title}". Please review it.`,
    });

    return res.status(201).json({
      success: true,
      message: "Ownership claim submitted successfully.",
      claim,
    });
  } catch (error) {
    console.error("Submit ownership claim error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit ownership claim.",
    });
  }
};


// Get claims submitted by the logged-in user
export const getMyClaims = async (req, res) => {
  try {
    const claims = await OwnershipClaim.find({
      claimant: req.user._id,
    })
      .populate("finder", "name email")
      .populate({
        path: "match",
        populate: [
          { path: "lostItem", select: "title image location status" },
          { path: "foundItem", select: "title image location status" },
        ],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.error("Get my claims error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your claims.",
    });
  }
};


// Get claims received by the logged-in finder
export const getReceivedClaims = async (req, res) => {
  try {
    const claims = await OwnershipClaim.find({
      finder: req.user._id,
    })
      .populate("claimant", "name email")
      .populate({
        path: "match",
        populate: [
          { path: "lostItem", select: "title image location status" },
          { path: "foundItem", select: "title image location status" },
        ],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.error("Get received claims error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch received claims.",
    });
  }
};


// Finder approves or rejects an ownership claim
export const reviewOwnershipClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, reviewNotes = "" } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID.",
      });
    }

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be approved or rejected.",
      });
    }

    const claim = await OwnershipClaim.findById(id)
      .populate("claimant", "name")
      .populate("match");

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Ownership claim not found.",
      });
    }

    if (claim.finder.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the finder can review this claim.",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This claim has already been reviewed.",
      });
    }

    const match = await Match.findById(claim.match._id)
      .populate("lostItem", "title owner")
      .populate("foundItem", "title owner");

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "The associated match no longer exists.",
      });
    }

    if (decision === "approved") {
      if (match.status !== "potential") {
        return res.status(400).json({
          success: false,
          message: "This match has already been decided.",
        });
      }

      match.status = "confirmed";
      await match.save();
    }

    claim.status = decision;
    claim.reviewNotes = reviewNotes.trim();
    claim.reviewedAt = new Date();

    await claim.save();

    await Notification.create({
      recipient: claim.claimant._id,
      item: match.lostItem._id,
      matchedItem: match.foundItem._id,
      similarity: match.similarity,
      matchPercentage: match.matchPercentage,
      type: "ownership_claim",
      message:
        decision === "approved"
          ? "Your ownership claim has been approved. Please coordinate the item handover."
          : "Your ownership claim was not approved. Please review the finder's feedback.",
    });

    return res.status(200).json({
      success: true,
      message: `Ownership claim ${decision} successfully.`,
      claim,
      match,
    });
  } catch (error) {
    console.error("Review ownership claim error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to review ownership claim.",
    });
  }
};

import Match from "../models/Match.js";
import Notification from "../models/Notification.js";
import Item from "../models/Item.js";

// Get matches involving the current user
export const getMyMatches = async (req, res) => {
  try {
    const userItemIds = await getUserItemIds(req.user._id);

    const matches = await Match.find({
      $or: [
        { lostItem: { $in: userItemIds } },
        { foundItem: { $in: userItemIds } },
      ],
    })
      .populate(
        "lostItem",
        "title description category status location date image owner"
      )
      .populate(
        "foundItem",
        "title description category status location date image owner"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json(matches);
  } catch (error) {
    console.error("Get my matches error:", error);

    return res.status(500).json({
      message: "Unable to fetch matches.",
    });
  }
};

// Direct confirmation is disabled.
// Matches must be confirmed through ownership verification.
export const confirmMatch = async (req, res) => {
  return res.status(403).json({
    success: false,
    message:
      "Direct match confirmation is disabled. Ownership verification is required.",
  });
};

// Reject a potential match
export const rejectMatch = async (req, res) => {
  try {
    const { id } = req.params;

    const match = await Match.findById(id)
      .populate("lostItem", "owner")
      .populate("foundItem", "owner");

    if (!match) {
      return res.status(404).json({
        message: "Match not found.",
      });
    }

    const userId = req.user._id.toString();
    const lostOwner = match.lostItem.owner.toString();
    const foundOwner = match.foundItem.owner.toString();

    if (userId !== lostOwner && userId !== foundOwner) {
      return res.status(403).json({
        message: "You are not authorized to update this match.",
      });
    }

    if (match.status !== "potential") {
      return res.status(400).json({
        message: `This match has already been ${match.status}.`,
      });
    }

    match.status = "rejected";
    await match.save();

    return res.status(200).json({
      message: "Match rejected successfully.",
      match,
    });
  } catch (error) {
    console.error("Reject match error:", error);

    return res.status(500).json({
      message: "Unable to reject match.",
    });
  }
};

// Mark a confirmed match as returned
export const returnMatch = async (req, res) => {
  try {
    const { id } = req.params;

    const match = await Match.findById(id)
      .populate("lostItem", "owner title")
      .populate("foundItem", "owner title");

    if (!match) {
      return res.status(404).json({
        message: "Match not found.",
      });
    }

    const userId = req.user._id.toString();
    const lostOwner = match.lostItem.owner.toString();
    const foundOwner = match.foundItem.owner.toString();

    // Only an owner of either item can mark it as returned
    if (userId !== lostOwner && userId !== foundOwner) {
      return res.status(403).json({
        message: "You are not authorized to update this match.",
      });
    }

    // Only confirmed matches can be marked as returned
    if (match.status !== "confirmed") {
      return res.status(400).json({
        message:
          "Only confirmed matches can be marked as returned.",
      });
    }

    // Update match status
    match.status = "returned";
    await match.save();

    // Mark both associated items as returned
    await Item.findByIdAndUpdate(match.lostItem._id, {
      status: "returned",
    });

    await Item.findByIdAndUpdate(match.foundItem._id, {
      status: "returned",
    });

    // Notify both item owners
    const notificationMessage =
      `The item match between "${match.lostItem.title}" and "${match.foundItem.title}" has been marked as returned.`;

    await Notification.create({
      recipient: match.lostItem.owner,
      item: match.lostItem._id,
      matchedItem: match.foundItem._id,
      similarity: match.similarity,
      matchPercentage: match.matchPercentage,
      type: "match",
      message: notificationMessage,
    });

    if (foundOwner !== lostOwner) {
      await Notification.create({
        recipient: match.foundItem.owner,
        item: match.foundItem._id,
        matchedItem: match.lostItem._id,
        similarity: match.similarity,
        matchPercentage: match.matchPercentage,
        type: "match",
        message: notificationMessage,
      });
    }

    return res.status(200).json({
      message:
        "Match marked as returned and both users have been notified.",
      match,
    });
  } catch (error) {
    console.error("Return match error:", error);

    return res.status(500).json({
      message: "Unable to mark match as returned.",
    });
  }
};

// Helper function
const getUserItemIds = async (userId) => {
  const items = await Item.find({
    owner: userId,
  }).select("_id");

  return items.map((item) => item._id);
};

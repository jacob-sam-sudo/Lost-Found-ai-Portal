import Match from "../models/Match.js";
import Notification from "../models/Notification.js";
import Item from "../models/Item.js";

// Get matches involving the current user
export const getMyMatches = async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [
        {
          lostItem: {
            $in: await getUserItemIds(req.user._id),
          },
        },
        {
          foundItem: {
            $in: await getUserItemIds(req.user._id),
          },
        },
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
    console.error(
      "Get my matches error:",
      error
    );

    return res.status(500).json({
      message: "Unable to fetch matches.",
    });
  }
};


// Confirm a potential match
export const confirmMatch = async (req, res) => {
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

    const lostOwner =
      match.lostItem.owner.toString();

    const foundOwner =
      match.foundItem.owner.toString();

    // Check whether the logged-in user owns either item
    if (
      userId !== lostOwner &&
      userId !== foundOwner
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to update this match.",
      });
    }

    // Prevent changing an already decided match
    if (match.status !== "potential") {
      return res.status(400).json({
        message:
          `This match has already been ${match.status}.`,
      });
    }

    // Update match status
    match.status = "confirmed";

    await match.save();


    /*
     * ------------------------------------------------
     * NOTIFY BOTH ITEM OWNERS
     * ------------------------------------------------
     */

    const notificationMessage =
      `The potential match between "${match.lostItem.title}" and "${match.foundItem.title}" has been confirmed.`;

    // Notification for lost-item owner
    await Notification.create({
      recipient: match.lostItem.owner,
      item: match.lostItem._id,
      matchedItem: match.foundItem._id,
      similarity: match.similarity,
      matchPercentage:
        match.matchPercentage,
      type: "match",
      message: notificationMessage,
    });

    // Notification for found-item owner
    if (
      foundOwner !== lostOwner
    ) {
      await Notification.create({
        recipient: match.foundItem.owner,
        item: match.foundItem._id,
        matchedItem: match.lostItem._id,
        similarity: match.similarity,
        matchPercentage:
          match.matchPercentage,
        type: "match",
        message: notificationMessage,
      });
    }


    return res.status(200).json({
      message:
        "Match confirmed and both users have been notified.",
      match,
    });

  } catch (error) {
    console.error(
      "Confirm match error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to confirm match.",
    });
  }
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

    const lostOwner =
      match.lostItem.owner.toString();

    const foundOwner =
      match.foundItem.owner.toString();

    if (
      userId !== lostOwner &&
      userId !== foundOwner
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to update this match.",
      });
    }

    // Prevent changing an already decided match
    if (match.status !== "potential") {
      return res.status(400).json({
        message:
          `This match has already been ${match.status}.`,
      });
    }

    match.status = "rejected";

    await match.save();

    return res.status(200).json({
      message: "Match rejected successfully.",
      match,
    });

  } catch (error) {
    console.error(
      "Reject match error:",
      error
    );

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

    const lostOwner =
      match.lostItem.owner.toString();

    const foundOwner =
      match.foundItem.owner.toString();

    // Only an owner of either item can mark it as returned
    if (
      userId !== lostOwner &&
      userId !== foundOwner
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to update this match.",
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
await Item.findByIdAndUpdate(
  match.lostItem._id,
  {
    status: "returned",
  }
);

await Item.findByIdAndUpdate(
  match.foundItem._id,
  {
    status: "returned",
  }
);
    /*
     * ------------------------------------------------
     * NOTIFY BOTH ITEM OWNERS
     * ------------------------------------------------
     */

    const notificationMessage =
      `The item match between "${match.lostItem.title}" and "${match.foundItem.title}" has been marked as returned.`;

    // Notify lost-item owner
    await Notification.create({
      recipient: match.lostItem.owner,
      item: match.lostItem._id,
      matchedItem: match.foundItem._id,
      similarity: match.similarity,
      matchPercentage:
        match.matchPercentage,
      type: "match",
      message: notificationMessage,
    });

    // Notify found-item owner
    if (foundOwner !== lostOwner) {
      await Notification.create({
        recipient: match.foundItem.owner,
        item: match.foundItem._id,
        matchedItem: match.lostItem._id,
        similarity: match.similarity,
        matchPercentage:
          match.matchPercentage,
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
    console.error(
      "Return match error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to mark match as returned.",
    });
  }
};



// Helper function
const getUserItemIds = async (userId) => {
  const Item = (
    await import("../models/Item.js")
  ).default;

  const items = await Item.find({
    owner: userId,
  }).select("_id");

  return items.map(
    (item) => item._id
  );
};
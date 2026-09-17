import Item from "../models/Item.js";
import cloudinary from "../config/cloudinary.js";
import Notification from "../models/Notification.js";
import Match from "../models/Match.js";
import { findAiMatches } from "../services/aiService.js";


// CREATE ITEM
export const createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      status,
      location,
      date,
    } = req.body;

    let imageUrl = "";

    // Upload image to Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: "lost-found-items",
        }
      );

      imageUrl = result.secure_url;
    }

    // Create item in MongoDB
    const item = await Item.create({
      title,
      description,
      category,
      status,
      location,
      date,
      image: imageUrl,
      owner: req.user._id,
    });

    /*
     * ------------------------------------------------
     * AUTOMATIC AI MATCHING
     * ------------------------------------------------
     *
     * The item has already been saved successfully.
     * AI matching is performed afterwards so that an
     * AI-service failure does not prevent item creation.
     */

    try {
      // Find the opposite type of item
      const oppositeStatus =
        status === "lost" ? "found" : "lost";

      // Get existing opposite-status items
      const candidateItems = await Item.find({
        status: oppositeStatus,
        _id: { $ne: item._id },
      }).populate(
        "owner",
        "name email avatar"
      );

      if (candidateItems.length > 0) {
        // Build text representation of the newly created item
        const queryText = [
          item.title,
          item.description,
          item.category,
          item.location,
        ]
          .filter(Boolean)
          .join(". ");

        // Build candidate data for the AI service
        const candidates = candidateItems.map(
          (candidate) => ({
            id: candidate._id.toString(),
            text: [
              candidate.title,
              candidate.description,
              candidate.category,
              candidate.location,
            ]
              .filter(Boolean)
              .join(". "),
          })
        );

        // Send data to Python AI service
        const aiResult = await findAiMatches(
          queryText,
          candidates
        );

        // Current AI threshold
        const threshold = 0.75;

        // Keep only strong matches and limit to top 5
        const strongMatches = (
          aiResult.matches || []
        )
          .filter(
            (match) =>
              match.similarity >= threshold
          )
          .slice(0, 5);

        // Save AI matches to the newly created item
        if (strongMatches.length > 0) {
          item.aiMatches = strongMatches.map(
            (match) => ({
              matchedItem: match.id,
              similarity: match.similarity,
              matchPercentage:
                match.match_percentage,
            })
          );

          await item.save();

          /*
           * ------------------------------------------------
           * CREATE MATCHES AND NOTIFICATIONS
           * ------------------------------------------------
           */

          for (const match of strongMatches) {
            const matchedItem =
              candidateItems.find(
                (candidate) =>
                  candidate._id.toString() ===
                  match.id
              );

            if (!matchedItem) {
              continue;
            }

            // Determine which item is the lost item
            const lostItemId =
              item.status === "lost"
                ? item._id
                : matchedItem._id;

            // Determine which item is the found item
            const foundItemId =
              item.status === "found"
                ? item._id
                : matchedItem._id;

            /*
             * --------------------------------------------
             * CREATE OR REUSE MATCH RECORD
             * --------------------------------------------
             */

            let matchRecord =
              await Match.findOne({
                lostItem: lostItemId,
                foundItem: foundItemId,
              });

            if (!matchRecord) {
              matchRecord =
                await Match.create({
                  lostItem: lostItemId,
                  foundItem: foundItemId,
                  similarity:
                    match.similarity,
                  matchPercentage:
                    match.match_percentage,
                  status: "potential",
                });
            }

            /*
             * --------------------------------------------
             * NOTIFICATION FOR NEW ITEM OWNER
             * --------------------------------------------
             */

            const existingNotification =
              await Notification.findOne({
                recipient: item.owner,
                item: item._id,
                matchedItem:
                  matchedItem._id,
                type: "match",
              });

            if (!existingNotification) {
              await Notification.create({
                recipient: item.owner,
                item: item._id,
                matchedItem:
                  matchedItem._id,
                similarity:
                  match.similarity,
                matchPercentage:
                  match.match_percentage,
                type: "match",
                message: `A potential match was found for your item "${item.title}".`,
              });
            }

            /*
             * --------------------------------------------
             * NOTIFICATION FOR OPPOSITE ITEM OWNER
             * --------------------------------------------
             */

            const matchedOwnerId =
              matchedItem.owner?._id;

            if (
              matchedOwnerId &&
              matchedOwnerId.toString() !==
                item.owner.toString()
            ) {
              const existingMatchedNotification =
                await Notification.findOne({
                  recipient: matchedOwnerId,
                  item: matchedItem._id,
                  matchedItem: item._id,
                  type: "match",
                });

              if (
                !existingMatchedNotification
              ) {
                await Notification.create({
                  recipient:
                    matchedOwnerId,
                  item: matchedItem._id,
                  matchedItem:
                    item._id,
                  similarity:
                    match.similarity,
                  matchPercentage:
                    match.match_percentage,
                  type: "match",
                  message: `A potential match was found for your item "${matchedItem.title}".`,
                });
              }
            }
          }
        }

        console.log(
          `AI matching completed for item ${item._id}`
        );

        console.log(
          `Strong matches found: ${strongMatches.length}`
        );
      } else {
        console.log(
          "No opposite-status items available for AI matching."
        );
      }
    } catch (aiError) {
      /*
       * AI failure must NOT make item creation fail.
       * The item has already been successfully stored.
       */
      console.error(
        "Automatic AI matching failed:",
        aiError.message
      );
    }

    // Return the created item
    res.status(201).json(item);

  } catch (error) {
    console.error(
      "Create item error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// GET ALL ITEMS
export const getItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate(
        "owner",
        "name email avatar"
      )
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET SINGLE ITEM
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(
      req.params.id
    ).populate(
      "owner",
      "name email avatar"
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE ITEM
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(
      req.params.id
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Check ownership
    if (
      item.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // Update text fields
    item.title =
      req.body.title ?? item.title;

    item.description =
      req.body.description ??
      item.description;

    item.category =
      req.body.category ??
      item.category;

    item.status =
      req.body.status ??
      item.status;

    item.location =
      req.body.location ??
      item.location;

    item.date =
      req.body.date ?? item.date;

    // Update image if a new one was uploaded
    if (req.file) {
      const result =
        await cloudinary.uploader.upload(
          req.file.path,
          {
            folder: "lost-found-items",
          }
        );

      item.image = result.secure_url;
    }

    const updatedItem =
      await item.save();

    res.status(200).json({
      message:
        "Item updated successfully",
      item: updatedItem,
    });

  } catch (error) {
    console.error(
      "Update item error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// DELETE ITEM
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(
      req.params.id
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (
      item.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await item.deleteOne();

    res.json({
      message:
        "Item deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// MY ITEMS
export const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
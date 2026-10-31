import Item from "../models/Item.js";
import cloudinary from "../config/cloudinary.js";
import Notification from "../models/Notification.js";
import Match from "../models/Match.js";
import {
  findAiMatches,
  extractImageText,
  extractImageEmbedding,
} from "../services/aiService.js";

// Calculate cosine similarity between two image embeddings
const calculateCosineSimilarity = (vectorA, vectorB) => {
  if (
    !Array.isArray(vectorA) ||
    !Array.isArray(vectorB) ||
    vectorA.length === 0 ||
    vectorA.length !== vectorB.length
  ) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] ** 2;
    magnitudeB += vectorB[i] ** 2;
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  );
};

// Calculate category compatibility between two items
const calculateCategoryCompatibility = (categoryA, categoryB) => {
  if (!categoryA || !categoryB) {
    return null;
  }

  const normalizedA = categoryA.trim().toLowerCase();
  const normalizedB = categoryB.trim().toLowerCase();

  // Exact category match
  if (normalizedA === normalizedB) {
    return normalizedA === "other" ? 0.5 : 1.0;
  }

  // One item is Other and the other is a predefined category
  if (normalizedA === "other" || normalizedB === "other") {
    return 0.25;
  }

  // Different predefined categories
  return 0.0;
};

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
    let extractedText = "";
    let imageEmbedding = [];

    // Upload image to Cloudinary and extract image information
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: "lost-found-items",
        }
      );

      imageUrl = result.secure_url;

      console.log("Uploaded file MIME type:", req.file.mimetype);
      console.log("Uploaded file name:", req.file.originalname);
      console.log("Uploaded file path:", req.file.path);

      // OCR is optional: failure must not block item creation
      try {
        const ocrResult = await extractImageText(req.file.path);

        extractedText = ocrResult.extracted_text || "";

        console.log(
          `OCR completed. Text found: ${Boolean(extractedText)}`
        );
      } catch (ocrError) {
        console.error(
          "OCR extraction failed:",
          ocrError.message
        );
      }

      // Generate CLIP image embedding
      try {
        imageEmbedding = await extractImageEmbedding(
          req.file.path
        );

        console.log(
          `CLIP embedding generated. Dimensions: ${imageEmbedding.length}`
        );
      } catch (embeddingError) {
        console.error(
          "Image embedding generation failed:",
          embeddingError.message
        );
      }
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
      extractedText,
      imageEmbedding,
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

      // Visual image similarity diagnostic
      if (item.imageEmbedding.length > 0) {
        const visualMatches = candidateItems
          .filter(
            (candidate) =>
              candidate.imageEmbedding &&
              candidate.imageEmbedding.length === 512
          )
          .map((candidate) => {
            const similarity = calculateCosineSimilarity(
              item.imageEmbedding,
              candidate.imageEmbedding
            );

            return {
              itemId: candidate._id,
              title: candidate.title,
              similarity: Number(similarity.toFixed(4)),
              matchPercentage: Number(
                (similarity * 100).toFixed(2)
              ),
            };
          })
          .sort((a, b) => b.similarity - a.similarity);

        console.log("Visual similarity results:");
        console.table(visualMatches);
      }

      if (candidateItems.length > 0) {
        // Build text representation of the newly created item
        const queryText = [
          item.title,
          item.description,
          item.category,
          item.location,
          item.extractedText,
        ]
          .filter(Boolean)
          .join(". ");

        // Build candidate data for the AI service
        const candidates = candidateItems.map((candidate) => ({
          id: candidate._id.toString(),
          text: [
            candidate.title,
            candidate.description,
            candidate.category,
            candidate.location,
            candidate.extractedText,
          ]
            .filter(Boolean)
            .join(". "),
        }));

        // Send data to Python AI service
        const aiResult = await findAiMatches(
          queryText,
          candidates
        );

        // ------------------------------------------------
        // COMBINED AI MATCHING
        // ------------------------------------------------

        // Store text similarity scores for quick lookup
        const textMatchMap = new Map(
          (aiResult.matches || []).map((match) => [
            match.id,
            match.similarity,
          ])
        );

        // Calculate combined text and visual similarity
       // Calculate combined text, visual and category similarity
const combinedMatches = candidateItems
  .map((candidate) => {
    const textScore = textMatchMap.get(
      candidate._id.toString()
    );

    const visualScore =
      candidate.imageEmbedding?.length === 512 &&
      item.imageEmbedding?.length === 512
        ? calculateCosineSimilarity(
            item.imageEmbedding,
            candidate.imageEmbedding
          )
        : null;

    const categoryScore = calculateCategoryCompatibility(
      item.category,
      candidate.category
    );

    let weightedScore = 0;
    let totalWeight = 0;

    // Text similarity: 50%
    if (
      textScore !== undefined &&
      Number.isFinite(textScore)
    ) {
      weightedScore += 0.50 * textScore;
      totalWeight += 0.50;
    }

    // Visual similarity: 30%
    if (
      visualScore !== null &&
      Number.isFinite(visualScore)
    ) {
      weightedScore += 0.30 * visualScore;
      totalWeight += 0.30;
    }

    // Category compatibility: 20%
    if (categoryScore !== null) {
      weightedScore += 0.20 * categoryScore;
      totalWeight += 0.20;
    }

    // Require at least one actual AI similarity signal.
    // Category alone must not create a match.
    const hasAiSignal =
      (textScore !== undefined &&
        Number.isFinite(textScore)) ||
      visualScore !== null;

    const combinedScore =
      hasAiSignal && totalWeight > 0
        ? weightedScore / totalWeight
        : null;

    return {
      id: candidate._id.toString(),
      title: candidate.title,

      textScore:
        textScore !== undefined
          ? Number(textScore.toFixed(4))
          : null,

      visualScore:
        visualScore !== null
          ? Number(visualScore.toFixed(4))
          : null,

      categoryScore:
        categoryScore !== null
          ? Number(categoryScore.toFixed(4))
          : null,

      combinedScore:
        combinedScore !== null
          ? Number(combinedScore.toFixed(4))
          : null,
    };
  })
  .filter(
    (match) => match.combinedScore !== null
  )
  .sort(
    (a, b) => b.combinedScore - a.combinedScore
  );

        // Provisional combined score threshold
        const threshold = 0.60;

        // Convert combined results into the format
        // expected by the existing Match creation logic.
        const strongMatches = combinedMatches
          .filter(
            (match) => match.combinedScore >= threshold
          )
          .slice(0, 5)
          .map((match) => ({
            id: match.id,
            similarity: match.combinedScore,
            match_percentage: Number(
              (match.combinedScore * 100).toFixed(2)
            ),
          }));

        console.log("Combined AI matching results:");
        console.table(combinedMatches);

        console.log("Strong combined matches:");
        console.table(strongMatches);

        // ------------------------------------------------
        // SAVE AI MATCHES TO THE NEWLY CREATED ITEM
        // ------------------------------------------------

        if (strongMatches.length > 0) {
          item.aiMatches = strongMatches.map(
            (match) => ({
              matchedItem: match.id,
              similarity: match.similarity,
              matchPercentage: match.match_percentage,
            })
          );

          await item.save();

          /*
           * ------------------------------------------------
           * CREATE MATCHES AND NOTIFICATIONS
           * ------------------------------------------------
           */

          for (const match of strongMatches) {
            const matchedItem = candidateItems.find(
              (candidate) =>
                candidate._id.toString() === match.id
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

            let matchRecord = await Match.findOne({
              lostItem: lostItemId,
              foundItem: foundItemId,
            });

            if (!matchRecord) {
              matchRecord = await Match.create({
                lostItem: lostItemId,
                foundItem: foundItemId,
                similarity: match.similarity,
                matchPercentage: match.match_percentage,
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
                matchedItem: matchedItem._id,
                type: "match",
              });

            if (!existingNotification) {
              await Notification.create({
                recipient: item.owner,
                item: item._id,
                matchedItem: matchedItem._id,
                similarity: match.similarity,
                matchPercentage: match.match_percentage,
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

              if (!existingMatchedNotification) {
                await Notification.create({
                  recipient: matchedOwnerId,
                  item: matchedItem._id,
                  matchedItem: item._id,
                  similarity: match.similarity,
                  matchPercentage: match.match_percentage,
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
      message: "Item updated successfully",
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
      message: "Item deleted successfully",
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
import Item from "../models/Item.js";

import {
  calculateSimilarity,
  findAiMatches,
} from "../services/aiService.js";


// --------------------------------------------------
// TEST SIMILARITY
// --------------------------------------------------

export const testSimilarity = async (req, res) => {
  try {
    const { item1, item2 } = req.body;

    if (!item1 || !item2) {
      return res.status(400).json({
        message: "Both item1 and item2 are required.",
      });
    }

    const result = await calculateSimilarity(
      item1,
      item2
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("AI controller error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};


// --------------------------------------------------
// FIND AI MATCHES FOR AN ITEM
// --------------------------------------------------

export const findMatches = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the requested item
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found.",
      });
    }

    // Only compare against the opposite status
    const oppositeStatus =
      item.status === "lost"
        ? "found"
        : "lost";

    const candidateItems = await Item.find({
      status: oppositeStatus,
      _id: { $ne: item._id },
    })
      .populate("owner", "name email avatar")
      .sort({ createdAt: -1 });

    // No possible candidates
    if (candidateItems.length === 0) {
      return res.status(200).json({
        item: {
          id: item._id,
          title: item.title,
          status: item.status,
        },
        matches: [],
        message: "No opposite-status items available for matching.",
      });
    }

    // Create text representation of the query item
    const queryText = [
      item.title,
      item.description,
      item.category,
      item.location,
    ]
      .filter(Boolean)
      .join(". ");

    // Create candidate text representations
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

    // Ask Python AI service for similarities
    const aiResult = await findAiMatches(
      queryText,
      candidates
    );

    // Use 0.75 as the initial semantic-match threshold
    const threshold = 0.75;

    // Keep only strong matches
    const strongMatches = aiResult.matches
      .filter(
        (match) =>
          match.similarity >= threshold
      )
      .slice(0, 5);

    // Attach complete MongoDB item information
    const matches = strongMatches.map(
      (match) => {

        const matchedItem =
          candidateItems.find(
            (candidate) =>
              candidate._id.toString() === match.id
          );

        return {
          item: matchedItem,
          similarity: match.similarity,
          matchPercentage:
            match.match_percentage,
        };
      }
    );

    return res.status(200).json({
      item: {
        id: item._id,
        title: item.title,
        status: item.status,
      },
      threshold,
      matches,
    });

  } catch (error) {
    console.error(
      "Find matches error:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};
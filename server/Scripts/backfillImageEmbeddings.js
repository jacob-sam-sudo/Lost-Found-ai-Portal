
import "dotenv/config";
import mongoose from "mongoose";
import axios from "axios";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import Item from "../models/Item.js";
import { extractImageEmbedding } from "../services/aiService.js";

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URL;

const main = async () => {
  if (!MONGO_URI) {
    throw new Error("MongoDB connection string not found in .env");
  }

  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected.");

  const items = await Item.find({
    image: { $exists: true, $ne: "" },
  }).select("_id title image imageEmbedding");

  const itemsToProcess = items.filter(
    (item) => item.imageEmbedding?.length !== 512
  );

  console.log(`Total items found: ${items.length}`);
  console.log(`Items requiring embeddings: ${itemsToProcess.length}`);

  let successful = 0;
  let failed = 0;

  const tempDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "lost-found-clip-")
  );

  try {
    for (const item of itemsToProcess) {
      let tempFilePath;

      try {
        console.log(`\nProcessing: ${item.title} (${item._id})`);

        // Download the existing Cloudinary image
        const response = await axios.get(item.image, {
          responseType: "arraybuffer",
          timeout: 30000,
          maxContentLength: 10 * 1024 * 1024,
        });

        // Save temporarily so we can reuse the existing AI service
        tempFilePath = path.join(
          tempDirectory,
          `${item._id}.img`
        );

        await fs.writeFile(tempFilePath, response.data);

        // Generate the CLIP embedding
        const embedding = await extractImageEmbedding(
          tempFilePath
        );

        if (!Array.isArray(embedding) || embedding.length !== 512) {
          throw new Error("Invalid CLIP embedding dimensions.");
        }

        // Update only the embedding field
        await Item.updateOne(
          { _id: item._id },
          {
            $set: {
              imageEmbedding: embedding,
            },
          }
        );

        successful++;

        console.log(
          `SUCCESS: ${item.title} - ${embedding.length} dimensions`
        );
      } catch (error) {
        failed++;

        console.error(
          `FAILED: ${item.title} - ${error.message}`
        );
      } finally {
        if (tempFilePath) {
          await fs.unlink(tempFilePath).catch(() => {});
        }
      }
    }
  } finally {
    await fs.rm(tempDirectory, {
      recursive: true,
      force: true,
    });
  }

  console.log("\n========== BACKFILL SUMMARY ==========");
  console.log(`Total processed: ${itemsToProcess.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log("======================================");

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error("Backfill failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});

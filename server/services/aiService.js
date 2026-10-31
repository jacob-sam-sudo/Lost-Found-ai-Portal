import axios from "axios";
import FormData from "form-data";
import fs from "node:fs";

const AI_SERVICE_URL = "http://127.0.0.1:8000";

export const calculateSimilarity = async (item1, item2) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/similarity`,
      {
        item1,
        item2,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "AI service error:",
      error.response?.data || error.message
    );

    throw new Error("Unable to connect to AI service.");
  }
};

export const findAiMatches = async (query, candidates) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/match`,
      {
        query,
        candidates,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "AI matching service error:",
      error.response?.data || error.message
    );

    throw new Error("Unable to connect to AI matching service.");
  }
};



export const extractImageText = async (imagePath) => {
  try {
    const formData = new FormData();

    formData.append(
      "file",
      fs.createReadStream(imagePath),
      {
        filename: "item-image.png",
        contentType: "image/png",
      }
    );

    const response = await axios.post(
      `${AI_SERVICE_URL}/ocr`,
      formData,
      {
        headers: formData.getHeaders(),
        maxBodyLength: 10 * 1024 * 1024 + 1024,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "OCR service error:",
      error.response?.data || error.message
    );

    throw new Error("Unable to extract text from image.");
  }
};

export const extractImageEmbedding = async (imagePath) => {
  try {
    const formData = new FormData();

    formData.append(
      "file",
      fs.createReadStream(imagePath),
      {
        filename: "item-image.png",
        contentType: "image/png",
      }
    );

    const response = await axios.post(
      `${AI_SERVICE_URL}/image-embedding`,
      formData,
      {
        headers: formData.getHeaders(),
        maxBodyLength: 10 * 1024 * 1024 + 1024,
      }
    );

    return response.data.embedding;

  } catch (error) {
    console.error(
      "Image embedding service error:",
      error.response?.data || error.message
    );

    throw new Error("Unable to generate image embedding.");
  }
};

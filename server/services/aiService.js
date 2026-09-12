import axios from "axios";

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
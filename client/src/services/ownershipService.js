import axios from "axios";

const API = "http://localhost:5000/api/ownership";

const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Submit an ownership claim
export const submitOwnershipClaim = async (matchId, answers) => {
  const response = await api.post(`/${matchId}`, answers);
  return response.data;
};

// Get claims submitted by the logged-in user
export const getMyClaims = async () => {
  const response = await api.get("/my-claims");
  return response.data;
};

// Get ownership claims received by the logged-in user
export const getReceivedClaims = async () => {
  const response = await api.get("/received");
  return response.data;
};

// Approve or reject an ownership claim
export const reviewOwnershipClaim = async (claimId, decision, reviewNotes = "") => {
  const response = await api.patch(`/${claimId}/review`, {
    decision,
    reviewNotes,
  });

  return response.data;
};
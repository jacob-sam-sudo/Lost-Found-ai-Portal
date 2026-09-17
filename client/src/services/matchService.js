import axios from "axios";

const API = "http://localhost:5000/api/matches";

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

// Get matches involving the logged-in user
export const getMyMatches = async () => {
  const response = await api.get("/");

  return response.data;
};

// Confirm a match
export const confirmMatch = async (id) => {
  const response = await api.put(
    `/${id}/confirm`
  );

  return response.data;
};

// Reject a match
export const rejectMatch = async (id) => {
  const response = await api.put(
    `/${id}/reject`
  );

  return response.data;
};

// Mark a confirmed match as returned
export const returnMatch = async (id) => {
  const response = await api.put(
    `/${id}/return`
  );

  return response.data;
};
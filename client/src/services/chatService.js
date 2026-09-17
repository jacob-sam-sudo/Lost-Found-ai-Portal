import axios from "axios";

const API = "http://localhost:5000/api/chats";

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

// Create or get chat for a confirmed match
export const createOrGetChat = async (matchId) => {
  const response = await api.post("/", {
    matchId,
  });

  return response.data;
};

// Get all chats for logged-in user
export const getMyChats = async () => {
  const response = await api.get("/");

  return response.data;
};

// Get messages for a chat
export const getChatMessages = async (chatId) => {
  const response = await api.get(`/${chatId}/messages`);

  return response.data;
};

// Send a message
export const sendMessage = async (chatId, text) => {
  const response = await api.post(`/${chatId}/messages`, {
    text,
  });

  return response.data;
};

// Mark messages as read
export const markMessagesAsRead = async (chatId) => {
  const response = await api.put(`/${chatId}/read`);

  return response.data;
};
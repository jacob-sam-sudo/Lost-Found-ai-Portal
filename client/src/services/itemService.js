import axios from "axios";

const API = "http://localhost:5000/api/items";

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

// Create Item
export const createItem = async (formData) => {
  const response = await api.post("/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Get All Items
export const getItems = async () => {
  const response = await api.get("/");

  return response.data;
};

// Get Single Item
export const getItem = async (id) => {
  const response = await api.get(`/${id}`);

  return response.data;
};

// Get My Items
export const getMyItems = async () => {
  const response = await api.get("/user/my-items");

  return response.data;
};

// Update Item
export const updateItem = async (id, data) => {
  const response = await api.put(`/${id}`, data);

  return response.data;
};

// Delete Item
export const deleteItem = async (id) => {
  const response = await api.delete(`/${id}`);

  return response.data;
};
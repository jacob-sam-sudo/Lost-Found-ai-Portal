import axios from "axios";

const API = "http://localhost:5000/api/notifications";

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

// Get current user's notifications
export const getNotifications = async () => {
  const response = await api.get("/");

  return response.data;
};

// Mark one notification as read
export const markNotificationAsRead = async (
  id
) => {
  const response = await api.put(
    `/${id}/read`
  );

  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await api.put(
    "/read-all"
  );

  return response.data;
};
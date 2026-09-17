import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import http from "http";
import { Server } from "socket.io";
dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a specific chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);

    console.log(
      `Socket ${socket.id} joined chat ${chatId}`
    );
  });

  // Leave a specific chat room
  socket.on("leaveChat", (chatId) => {
    socket.leave(chatId);

    console.log(
      `Socket ${socket.id} left chat ${chatId}`
    );
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(
      "User disconnected:",
      socket.id
    );
  });
});

app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/items", itemRoutes);
app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import { startAutoRoll } from "./server/rollEngine.js";
import admin from "./server/firebaseAdmin.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // phục vụ file trong /public

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Khi client kết nối
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Bắt đầu auto roll xúc xắc
startAutoRoll(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

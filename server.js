// ====== server.js ======
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const gameRoutes = require("./server/gameRoutes");
const adminRoutes = require("./server/adminRoutes");
const { startRolling } = require("./server/rollEngine");

// Routes
app.use("/api/game", gameRoutes);
app.use("/api/admin", adminRoutes);

// Test route
app.get("/api", (req, res) => {
  res.json({ message: "✅ API đang hoạt động" });
});

// Bắt đầu engine xúc xắc (mỗi 25s roll 1 lần)
startRolling();

// Lắng nghe port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

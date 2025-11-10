require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// === INIT FIREBASE ADMIN ===
const { initFirebase } = require("./server/firebaseAdmin");
initFirebase();

// === ROUTES ===
const gameRoutes = require("./server/gameRoutes");
const adminRoutes = require("./server/adminRoutes");
const { startRolling } = require("./server/rollEngine");

// Gắn route
app.use("/api/game", gameRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api", (req, res) => {
  res.json({ ok: true, msg: "Server đang chạy ổn định ✅" });
});

// === KHỞI ĐỘNG VÒNG QUAY GAME ===
startRolling(25 * 1000); // quay mỗi 25s

// === KHỞI ĐỘNG SERVER ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});

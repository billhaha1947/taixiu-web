require("dotenv").config();
process.env.GRPC_SSL_CIPHER_SUITES = "HIGH+ECDSA";
process.env.NODE_OPTIONS = "--openssl-legacy-provider";

const express = require("express");
const cors = require("cors");
const path = require("path");

// ==== INIT FIREBASE ADMIN TRƯỚC ====
const { initFirebase } = require("./server/firebaseAdmin");
const admin = initFirebase();
if (!admin) {
  console.warn("⚠️ Firebase Admin chưa được khởi tạo — kiểm tra biến môi trường FIREBASE_KEY");
}

// ==== EXPRESS APP CONFIG ====
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ==== ROUTES ====
const gameRoutes = require("./server/gameRoutes");
const adminRoutes = require("./server/adminRoutes");
app.use("/api/game", gameRoutes);
app.use("/api/admin", adminRoutes);

// ==== ENGINE ====
const { startRolling } = require("./server/rollEngine");
startRolling(25 * 1000); // mỗi 25s

// ==== TEST ROUTE ====
app.get("/api", (req, res) => res.json({ ok: true }));

// ==== START SERVER ====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});

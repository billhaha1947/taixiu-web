// server/adminRoutes.js
import express from "express";
import { db } from "./firebaseAdmin.js";

const router = express.Router();

// ✅ Route kiểm tra server hoạt động
router.get("/", (req, res) => {
  res.send("Admin API is working ✅");
});

// ✅ Route: Lấy danh sách user từ Firestore
router.get("/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ Route: Xóa user theo ID
router.delete("/user/:id", async (req, res) => {
  try {
    await db.collection("users").doc(req.params.id).delete();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ✅ Route: Set trạng thái game (ví dụ: tài, xỉu, dừng)
router.post("/set-mode", async (req, res) => {
  try {
    const { mode } = req.body;
    await db.collection("config").doc("game").set({ mode }, { merge: true });
    res.json({ message: `Game mode set to ${mode}` });
  } catch (error) {
    console.error("Error setting mode:", error);
    res.status(500).json({ error: "Failed to set mode" });
  }
});

export default router;

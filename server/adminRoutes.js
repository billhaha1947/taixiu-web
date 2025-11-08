import express from "express";
const { db } = require("./firebaseAdmin.js");
const router = express.Router();

// Lấy danh sách user
router.get("/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => doc.data());
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Xóa toàn bộ lịch sử game
router.delete("/clear-history", async (req, res) => {
  try {
    const snapshot = await db.collection("games").get();
    const batch = db.batch();
    snapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    res.json({ success: true, message: "Đã xóa toàn bộ lịch sử." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

const express = require("express");
const { db } = require("./firebaseAdmin");

const router = express.Router();

// Xem danh sách người dùng
router.get("/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tải danh sách người dùng!" });
  }
});

// Reset số dư
router.post("/reset-balance", async (req, res) => {
  try {
    const { userId, balance } = req.body;
    await db.collection("users").doc(userId).update({ balance });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Không thể reset số dư!" });
  }
});

module.exports = router;

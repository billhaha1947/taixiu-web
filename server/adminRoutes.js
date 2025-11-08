const express = require("express");
const router = express.Router();
const { db } = require("./firebaseAdmin");

router.get("/history", async (req, res) => {
  try {
    const snapshot = await db.collection("games").orderBy("timestamp", "desc").limit(20).get();
    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, history });
  } catch (error) {
    console.error("❌ Lỗi khi lấy lịch sử:", error);
    res.status(500).json({ error: "Không thể lấy dữ liệu lịch sử" });
  }
});

module.exports = router;

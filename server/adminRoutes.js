const express = require("express");
const router = express.Router();
const { db } = require("./firebaseAdmin.js");

router.get("/clear", async (req, res) => {
  try {
    const snapshot = await db.collection("results").get();
    const batch = db.batch();

    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    res.json({ message: "🧹 Đã xóa toàn bộ lịch sử kết quả" });
  } catch (err) {
    console.error("❌ Error clearing results:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

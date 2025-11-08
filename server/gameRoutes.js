const express = require("express");
const router = express.Router();
const { rollDiceAndSaveResult } = require("./rollEngine");

router.post("/play", async (req, res) => {
  try {
    const { userId, betType, betAmount } = req.body;
    if (!userId || !betType || !betAmount) {
      return res.status(400).json({ error: "Thiếu dữ liệu đặt cược!" });
    }

    const result = await rollDiceAndSaveResult(userId, betType, betAmount);
    res.json({ success: true, result });

  } catch (error) {
    console.error("❌ Lỗi khi xử lý game:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

module.exports = router;

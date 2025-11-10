const express = require("express");
const router = express.Router();

// Lưu tạm trạng thái game trong RAM
let gameState = {
  result: null,
  lastRoll: null,
  nextRoll: null,
  round: 0
};

// API: Lấy trạng thái hiện tại của game
router.get("/state", (req, res) => {
  try {
    res.json(gameState);
  } catch (err) {
    console.error("[ERR] /state:", err);
    res.status(500).json({ error: "Lỗi lấy trạng thái game" });
  }
});

// API: Người chơi đặt cược (chưa xử lý logic Firebase)
router.post("/bet", (req, res) => {
  const { userId, betType, amount } = req.body;
  if (!userId || !betType || !amount) {
    return res.status(400).json({ error: "Thiếu thông tin cược" });
  }

  console.log(`🎲 Người chơi ${userId} cược ${amount} vào ${betType}`);
  res.json({ success: true });
});

// Hàm này sẽ được rollEngine gọi để cập nhật kết quả
function updateGameState(newResult) {
  gameState = {
    result: newResult,
    lastRoll: Date.now(),
    nextRoll: Date.now() + 25 * 1000,
    round: gameState.round + 1
  };
  console.log("🎯 Game state updated:", gameState);
}

// Xuất cả router + hàm cập nhật cho rollEngine dùng
module.exports = router;
module.exports.updateGameState = updateGameState;

const express = require("express");
const router = express.Router();

// Lưu tạm trạng thái game trong bộ nhớ
let gameState = {
  result: null,     // Kết quả xúc xắc hiện tại
  lastRoll: null,   // Lần quay trước
  nextRoll: null,   // Thời gian lần quay kế tiếp
  round: 0,         // Số vòng quay
};

// Lấy trạng thái game hiện tại
router.get("/state", (req, res) => {
  try {
    res.json(gameState);
  } catch (err) {
    console.error("[ERR] /state:", err);
    res.status(500).json({ error: "Lỗi lấy game state" });
  }
});

// Hàm cập nhật kết quả game (được gọi từ rollEngine)
function updateGameState(result) {
  const now = Date.now();

  gameState.lastRoll = gameState.result;
  gameState.result = result;
  gameState.nextRoll = now + 25000; // 25s nữa quay tiếp
  gameState.round += 1;

  console.log(
    `🎲 Vòng ${gameState.round}:`,
    result.dice1,
    result.dice2,
    result.dice3
  );
}

module.exports = router;
module.exports.updateGameState = updateGameState;

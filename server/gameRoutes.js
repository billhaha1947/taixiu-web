const express = require("express");
const router = express.Router();

// Biến lưu tạm trạng thái game (RAM)
let gameState = {
  dice1: null,
  dice2: null,
  dice3: null,
  sum: null,
  result: null,     // "Tài" | "Xỉu"
  lastRoll: null,   // Kết quả lần quay trước
  nextRoll: Date.now() + 25000, // Dự kiến lần quay tiếp theo
  round: 0,         // Đếm số vòng
};

// API client gọi để lấy trạng thái hiện tại
router.get("/state", (req, res) => {
  try {
    res.json(gameState);
  } catch (err) {
    console.error("[ERR] /state:", err);
    res.status(500).json({ error: "Lỗi lấy game state" });
  }
});

// Hàm này sẽ được gọi từ rollEngine.js mỗi khi có kết quả mới
function updateGameState(resultData) {
  const now = Date.now();

  gameState = {
    dice1: resultData.dice1,
    dice2: resultData.dice2,
    dice3: resultData.dice3,
    sum: resultData.sum,
    result: resultData.result,
    lastRoll: gameState.result,
    nextRoll: now + 25000,
    round: gameState.round + 1,
    timestamp: now,
  };

  console.log(
    `🎲 Vòng ${gameState.round}: ${resultData.result} (${resultData.dice1},${resultData.dice2},${resultData.dice3}) - Tổng ${resultData.sum}`
  );
}

// Xuất module
module.exports = router;
module.exports.updateGameState = updateGameState;

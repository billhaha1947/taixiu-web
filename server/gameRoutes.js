const express = require("express");
const router = express.Router();
const { gameState } = require("./gameState");

router.get("/state", (req, res) => {
  try {
    res.json(gameState);
  } catch (err) {
    console.error("[ERR] /state:", err);
    res.status(500).json({ error: "Lỗi lấy game state" });
  }
});

module.exports = router;

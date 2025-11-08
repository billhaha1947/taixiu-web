// server/gameRoutes.js
import express from "express";
import { db } from "./firebaseAdmin.js";
import { rollDice } from "./rollEngine.js";

const router = express.Router();

let currentResult = null;
let bets = [];
let mode = 1; // 1: random

// Auto roll mỗi 25 giây
setInterval(async () => {
  currentResult = rollDice(mode);
  console.log("🎲 Kết quả:", currentResult);

  // Cập nhật lại số dư user theo kết quả
  for (const bet of bets) {
    const userRef = db.collection("users").doc(bet.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) continue;

    let balance = userDoc.data().balance || 0;
    if (currentResult.result === bet.choice) {
      balance += bet.amount;
    } else {
      balance -= bet.amount;
    }
    await userRef.update({ balance });
  }

  bets = []; // reset sau mỗi vòng
}, 25000);

// Người chơi đặt cược
router.post("/bet", async (req, res) => {
  const { uid, choice, amount } = req.body;
  if (!uid || !choice || !amount) return res.status(400).json({ error: "Thiếu dữ liệu" });

  bets.push({ uid, choice, amount });
  res.json({ success: true });
});

// Lấy tổng cược
router.get("/totals", (req, res) => {
  const totalTai = bets.filter(b => b.choice === "Tài").reduce((a, b) => a + b.amount, 0);
  const totalXiu = bets.filter(b => b.choice === "Xỉu").reduce((a, b) => a + b.amount, 0);
  res.json({ totalTai, totalXiu });
});

// Lấy kết quả hiện tại
router.get("/result", (req, res) => {
  res.json(currentResult || {});
});

export default router;

const express = require("express");
const router = express.Router();
const { admin } = require("./firebaseAdmin");
const db = () => admin.firestore();
const { v4: uuidv4 } = require("uuid");

// POST /api/game/bet
// body: { uid, choice: "Tài"|"Xỉu", amount }
router.post("/bet", async (req, res) => {
  try {
    const { uid, choice, amount } = req.body;
    if (!uid || !choice || !amount) return res.status(400).json({ error: "Missing" });

    // check user exists and balance
    const userRef = db().collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return res.status(404).json({ error: "User not found" });
    const user = userSnap.data();
    if ((user.balance || 0) < amount) return res.status(400).json({ error: "Insufficient balance" });

    // deduct balance immediately
    await userRef.update({ balance: admin.firestore.FieldValue.increment(-amount) });

    // create bet doc
    const bet = {
      uid,
      choice,
      amount,
      odds: 2, // default odds
      createdAt: Date.now(),
      processed: false
    };
    await db().collection("bets").add(bet);

    return res.json({ ok: true, message: "Bet placed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/game/current
router.get("/current", async (req, res) => {
  const snap = await db().doc("game/current").get();
  return res.json(snap.exists ? snap.data() : {});
});

// GET /api/game/history?limit=10
router.get("/history", async (req, res) => {
  const limit = parseInt(req.query.limit || "10", 10);
  const snaps = await db().collection("game").doc("history").collection("rolls")
    .orderBy("timestamp", "desc").limit(limit).get();
  const arr = [];
  snaps.forEach(s => arr.push(s.data()));
  res.json(arr);
});

// GET /api/game/top (simple leaderboard by balance)
router.get("/top", async (req, res) => {
  const snaps = await db().collection("users").orderBy("balance", "desc").limit(10).get();
  const arr = [];
  snaps.forEach(s => arr.push({ uid: s.id, ...s.data() }));
  res.json(arr);
});

module.exports = router;

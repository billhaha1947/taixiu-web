// /server/gameRoutes.js
const express = require("express");
const router = express.Router();
const { db } = require("./firebaseAdmin");

// get current round info
router.get("/current", async (req, res) => {
  try {
    const snap = await db.collection("game").doc("current").get();
    res.json(snap.exists ? snap.data() : {});
  } catch (err) {
    res.status(500).json({ error: "Cannot read current game" });
  }
});

// place bet (server checks balance and reserves money by subtracting immediately)
router.post("/bet", async (req, res) => {
  try {
    const { uid, choice, amount, roundId } = req.body;
    if (!uid || !choice || !amount || !roundId) return res.status(400).json({ error: "Missing fields" });
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return res.status(404).json({ error: "User not found" });

    // check balance
    const user = userSnap.data();
    if ((user.balance || 0) < amount) return res.status(400).json({ error: "Insufficient balance" });

    // create bet doc and mark as unsettled
    const betRef = db.collection("bets").doc();
    await betRef.set({
      uid,
      choice,
      amount,
      roundId: String(roundId),
      createdAt: Date.now(),
      settled: false,
    });

    // deduct immediately (reserve)
    await userRef.update({ balance: (user.balance || 0) - amount });

    // update aggregate totals in game/current
    const gameRef = db.collection("game").doc("current");
    await db.runTransaction(async (t) => {
      const gsnap = await t.get(gameRef);
      const data = gsnap.exists ? gsnap.data() : { totalBetTai:0, totalBetXiu:0 };
      if (choice === "Tài") data.totalBetTai = (data.totalBetTai || 0) + amount;
      else data.totalBetXiu = (data.totalBetXiu || 0) + amount;
      t.update(gameRef, { totalBetTai: data.totalBetTai, totalBetXiu: data.totalBetXiu });
    });

    res.json({ success: true, message: "Bet placed" });
  } catch (err) {
    console.error("bet error:", err);
    res.status(500).json({ error: "Bet failed" });
  }
});

// get recent history
router.get("/history", async (req, res) => {
  try {
    const snap = await db.collection("history").orderBy("ts", "desc").limit(20).get();
    const arr = snap.docs.map(d => d.data());
    res.json(arr);
  } catch (err) {
    res.status(500).json({ error: "Cannot load history" });
  }
});

// chat: post a chat message (optional)
router.post("/chat", async (req, res) => {
  try {
    const { uid, name, text } = req.body;
    if (!text) return res.status(400).json({ error: "Empty text" });
    const docRef = db.collection("chats").doc();
    await docRef.set({ uid: uid || "anon", name: name || "Anon", text, ts: Date.now() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Chat failed" });
  }
});

module.exports = router;

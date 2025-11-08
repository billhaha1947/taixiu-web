const express = require("express");
const router = express.Router();
const rollDice = require("./rollEngine.js");
const { db } = require("./firebaseAdmin.js");

router.get("/roll", async (req, res) => {
  try {
    const result = rollDice();
    await db.collection("results").add({
      ...result,
      createdAt: new Date(),
    });
    res.json(result);
  } catch (err) {
    console.error("❌ Error saving roll:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/history", async (req, res) => {
  try {
    const snapshot = await db.collection("results").orderBy("createdAt", "desc").limit(10).get();
    const data = snapshot.docs.map(doc => doc.data());
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

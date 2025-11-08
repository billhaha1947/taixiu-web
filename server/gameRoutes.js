import express from "express";
const { db } = require("./firebaseAdmin.js");
import { rollDice } from "./rollEngine.js";

const router = express.Router();

// Quay xúc xắc
router.post("/roll", async (req, res) => {
  try {
    const result = rollDice();
    await db.collection("games").add({
      ...result,
      createdAt: new Date(),
    });
    res.json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lịch sử
router.get("/history", async (req, res) => {
  try {
    const snapshot = await db
      .collection("games")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const data = snapshot.docs.map((doc) => doc.data());
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

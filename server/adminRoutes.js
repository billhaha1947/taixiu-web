// server/adminRoutes.js
import express from "express";
import { db } from "./firebaseAdmin.js";

const router = express.Router();

let rollMode = 1; // mặc định random

router.post("/set-mode", (req, res) => {
  const { mode } = req.body;
  rollMode = parseInt(mode) || 1;
  res.json({ success: true, mode: rollMode });
});

router.post("/set-balance", async (req, res) => {
  const { uid, balance } = req.body;
  try {
    await db.collection("users").doc(uid).update({ balance: Number(balance) });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export { rollMode };
export default router;

// /server/adminRoutes.js
const express = require("express");
const router = express.Router();
const { db } = require("./firebaseAdmin");

// get top users by balance
router.get("/users", async (req, res) => {
  try {
    const snap = await db.collection("users").orderBy("balance", "desc").limit(20).get();
    const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(arr);
  } catch (err) {
    res.status(500).json({ error: "Cannot load users" });
  }
});

// admin adjust (for simplicity, no auth here — add auth in production)
router.post("/adjust-balance", async (req, res) => {
  try {
    const { uid, balance } = req.body;
    await db.collection("users").doc(uid).update({ balance });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Adjust failed" });
  }
});

module.exports = router;

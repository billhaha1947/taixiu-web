const express = require("express");
const router = express.Router();
const { admin } = require("./firebaseAdmin");
const db = () => admin.firestore();

const ADMIN_SECRET = process.env.ADMIN_SECRET || null;

function checkAdmin(req, res, next){
  const secret = req.headers["x-admin-secret"];
  if (ADMIN_SECRET && secret === ADMIN_SECRET) return next();
  return res.status(403).json({ error: "Forbidden" });
}

// list users
router.get("/users", checkAdmin, async (req, res) => {
  const snaps = await db().collection("users").get();
  const arr = [];
  snaps.forEach(s => arr.push({ id: s.id, ...s.data() }));
  res.json(arr);
});

// set user balance
router.post("/user/set-balance", checkAdmin, async (req, res) => {
  const { uid, balance } = req.body;
  if (!uid) return res.status(400).json({ error: "Missing uid" });
  await db().collection("users").doc(uid).set({ balance: Number(balance) }, { merge: true });
  res.json({ ok: true });
});

// set odds (global)
router.post("/settings/set-odds", checkAdmin, async (req, res) => {
  const { odds } = req.body;
  await db().collection("settings").doc("game").set({ odds }, { merge: true });
  res.json({ ok: true });
});

module.exports = router;

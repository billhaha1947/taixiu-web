const express = require("express");
const { db } = require("./firebaseAdmin");
const rollDice = require("./rollEngine");

const router = express.Router();

// Lấy lịch sử gần đây
router.get("/history", async (req, res) => {
  try {
    const snapshot = await db.collection("history").orderBy("createdAt", "desc").limit(10).get();
    const history = snapshot.docs.map(doc => doc.data());
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi tải lịch sử!" });
  }
});

// Quay xúc xắc
router.post("/roll", async (req, res) => {
  try {
    const { userId, bet, choice } = req.body;
    if (!userId || !bet || !choice) return res.status(400).json({ error: "Thiếu dữ liệu!" });

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).json({ error: "Không tìm thấy người dùng!" });

    const userData = userDoc.data();
    if (userData.balance < bet) return res.status(400).json({ error: "Không đủ số dư!" });

    const roll = rollDice();
    const win = roll.result === choice;
    const newBalance = win ? userData.balance + bet : userData.balance - bet;

    await userRef.update({ balance: newBalance });

    await db.collection("history").add({
      userId,
      bet,
      choice,
      ...roll,
      win,
      createdAt: new Date(),
    });

    res.json({ ...roll, win, newBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi quay!" });
  }
});

module.exports = router;

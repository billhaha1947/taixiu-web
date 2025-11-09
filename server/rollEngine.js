// /server/rollEngine.js
const { db } = require("./firebaseAdmin");

async function rollDice() {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const total = dice1 + dice2;
  const result = total >= 11 ? "Tài" : "Xỉu";

  const data = {
    dice1,
    dice2,
    total,
    result,
    timestamp: Date.now()
  };

  // Ghi lên Firestore: collection "rolls" → doc "current"
  await db.collection("rolls").doc("current").set(data);
  console.log(`🎲 Roll mới: ${dice1} + ${dice2} = ${total} (${result})`);
}

function startRolling() {
  rollDice(); // roll ngay khi start
  setInterval(rollDice, 25000); // roll lại mỗi 25s
}

module.exports = { startRolling };

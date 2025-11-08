const { db } = require("./firebaseAdmin");

async function rollDiceAndSaveResult(userId, betType, betAmount) {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const dice3 = Math.floor(Math.random() * 6) + 1;
  const total = dice1 + dice2 + dice3;

  let result = total >= 11 ? "tài" : "xỉu";
  let win = betType === result;

  const record = {
    userId,
    betType,
    betAmount,
    dice: [dice1, dice2, dice3],
    total,
    result,
    win,
    timestamp: new Date(),
  };

  await db.collection("games").add(record);
  return record;
}

module.exports = { rollDiceAndSaveResult };

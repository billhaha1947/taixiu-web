function rollDice() {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const dice3 = Math.floor(Math.random() * 6) + 1;
  const total = dice1 + dice2 + dice3;
  const result = total >= 11 ? "Tài" : "Xỉu";

  return { dice: [dice1, dice2, dice3], total, result };
}

module.exports = rollDice;

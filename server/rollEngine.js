function rollDice() {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const dice3 = Math.floor(Math.random() * 6) + 1;
  const sum = dice1 + dice2 + dice3;

  let result = sum >= 11 ? "Tài" : "Xỉu";

  return { dice1, dice2, dice3, sum, result };
}

module.exports = rollDice;

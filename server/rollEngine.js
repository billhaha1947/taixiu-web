// server/rollEngine.js
export function rollDice(mode = 1) {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const dice3 = Math.floor(Math.random() * 6) + 1;
  let total = dice1 + dice2 + dice3;

  switch (mode) {
    case 2: // Tài cao hơn
      total = Math.max(total, 12 + Math.floor(Math.random() * 5));
      break;
    case 3: // Xỉu cao hơn
      total = Math.min(total, 9 - Math.floor(Math.random() * 3));
      break;
    case 4: // Toàn Tài
      total = 12 + Math.floor(Math.random() * 5);
      break;
    case 5: // Toàn Xỉu
      total = 3 + Math.floor(Math.random() * 7);
      break;
    default:
      break;
  }

  return { dice: [dice1, dice2, dice3], total, result: total >= 11 ? "Tài" : "Xỉu" };
}

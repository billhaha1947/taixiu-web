// server/rollEngine.js
import admin from "./firebaseAdmin.js"; // Import Firestore Admin SDK
import { Server } from "socket.io";

const db = admin.firestore();

// 🎲 Hàm tung xúc xắc (mode để chỉnh xác suất nếu cần)
export function rollDice(mode = 1) {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const dice3 = Math.floor(Math.random() * 6) + 1;
  let total = dice1 + dice2 + dice3;

  switch (mode) {
    case 2: // Ưu tiên Tài
      total = Math.max(total, 12 + Math.floor(Math.random() * 5));
      break;
    case 3: // Ưu tiên Xỉu
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

  return {
    dice: [dice1, dice2, dice3],
    total,
    result: total >= 11 ? "Tài" : "Xỉu",
  };
}

// 🚀 Hàm auto roll mỗi 25 giây, phát kết quả real-time + lưu Firestore
export function startAutoRoll(io) {
  console.log("✅ Auto Roll Engine started...");
  setInterval(async () => {
    const { dice, total, result } = rollDice();
    const time = new Date().toISOString();

    // Ghi vào Firestore (bộ sưu tập 'rolls')
    await db.collection("rolls").add({
      dice,
      total,
      result,
      time,
    });

    // Gửi real-time tới client
    io.emit("rollResult", { dice, total, result, time });

    console.log(`🎲 [${time}] -> ${dice.join(", ")} = ${total} (${result})`);
  }, 25000);
}

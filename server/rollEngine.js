const { admin } = require("./firebaseAdmin");
const { updateGameState } = require("./gameState"); // ✅ import đúng file

function db() {
  return admin.firestore();
}

let timer = null;

function randomDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function decideResult(sum) {
  return sum >= 8 ? "Tài" : "Xỉu";
}

function startRolling(intervalMs = 25000) {
  if (timer) clearInterval(timer);
  console.log("🎯 Roll engine started, interval:", intervalMs);

  rollOnce(intervalMs);
  timer = setInterval(() => rollOnce(intervalMs), intervalMs);
}

async function rollOnce(intervalMs) {
  try {
    const now = Date.now();
    const nextRollAt = now + intervalMs;

    await db().doc("game/current").set({
      nextRoll: nextRollAt,
      timestamp: now,
      status: "waiting",
    }, { merge: true });

    console.log("⌛ Chờ đến lần quay tiếp theo...");

    setTimeout(async () => {
      const d1 = randomDice();
      const d2 = randomDice();
      const d3 = randomDice();
      const sum = d1 + d2 + d3;
      const result = decideResult(sum);

      const rollData = {
        dice1: d1,
        dice2: d2,
        dice3: d3,
        sum,
        result,
        timestamp: Date.now(),
        nextRoll: Date.now() + intervalMs,
      };

      await db().doc("game/current").set(rollData, { merge: true });
      await settleBets(rollData);

      updateGameState(rollData); // ✅ đồng bộ sang frontend

    }, intervalMs);
  } catch (err) {
    console.error("❌ Lỗi rollOnce:", err);
  }
}

async function settleBets(rollData) {
  try {
    const betsSnap = await db().collection("bets").where("processed", "==", false).get();
    if (betsSnap.empty) return;

    const batch = db().batch();
    let totalPayout = 0;

    betsSnap.forEach((docSnap) => {
      const b = docSnap.data();
      const win = b.choice === rollData.result;
      const payout = win ? b.amount * (b.odds || 2) : 0;

      const userRef = db().collection("users").doc(b.uid);
      batch.update(docSnap.ref, { processed: true, win, payout, result: rollData.result });
      batch.set(userRef, { balance: admin.firestore.FieldValue.increment(payout) }, { merge: true });

      totalPayout += payout;
    });

    await batch.commit();
    await db().collection("game").doc("history").collection("rolls").add(rollData);
    await db().collection("system").doc("stats").set({ lastRoll: rollData, updated: Date.now() }, { merge: true });

    console.log(`💰 Tổng tiền trả: ${totalPayout}`);
  } catch (err) {
    console.error("❌ Lỗi settleBets:", err);
  }
}

module.exports = { startRolling, settleBets };

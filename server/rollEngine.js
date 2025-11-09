// /server/rollEngine.js
const { db } = require("./firebaseAdmin");

let currentRoundId = Date.now() + 25000; // ms timestamp of next roll
async function initRoundDoc(nextRollTs = Date.now() + 25000) {
  currentRoundId = nextRollTs;
  const roundDoc = {
    roundId: String(currentRoundId),
    nextRoll: currentRoundId,
    totalBetTai: 0,
    totalBetXiu: 0,
    lastResult: null,
    updatedAt: Date.now(),
  };
  await db.collection("game").doc("current").set(roundDoc, { merge: true });
}

function randomDice() {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const d3 = Math.floor(Math.random() * 6) + 1;
  const total = d1 + d2 + d3;
  const result = total >= 11 ? "Tài" : "Xỉu";
  return { dice: [d1, d2, d3], total, result };
}

async function settleBetsForRound(roundId, rollData) {
  // get all pending bets for this round
  const betsSnap = await db.collection("bets").where("roundId", "==", roundId).where("settled", "==", false).get();
  const batch = db.batch();
  for (const doc of betsSnap.docs) {
    const bet = doc.data();
    const userRef = db.collection("users").doc(bet.uid);
    const profit = bet.choice === rollData.result ? bet.amount : -bet.amount;
    // update user balance in transaction-like manner (simple read-update)
    const userSnap = await userRef.get();
    if (!userSnap.exists) continue;
    const userData = userSnap.data();
    const newBalance = (userData.balance || 0) + profit;
    batch.update(userRef, { balance: newBalance });
    // mark bet settled and record win boolean
    batch.update(doc.ref, { settled: true, win: bet.choice === rollData.result, payout: profit, settledAt: Date.now() });
    // add history entry
    const histRef = db.collection("history").doc();
    batch.set(histRef, {
      uid: bet.uid,
      roundId,
      amount: bet.amount,
      choice: bet.choice,
      dice: rollData.dice,
      total: rollData.total,
      result: rollData.result,
      win: bet.choice === rollData.result,
      ts: Date.now(),
    });
  }
  await batch.commit();
}

async function performRoll() {
  try {
    // compute roll
    const rollData = randomDice();
    const now = Date.now();
    // write last result and clear totals
    await db.collection("game").doc("current").update({
      lastResult: {
        dice: rollData.dice,
        total: rollData.total,
        result: rollData.result,
        ts: now,
      },
      // next roll timestamp (25s after now)
      nextRoll: now + 25000,
      totalBetTai: 0,
      totalBetXiu: 0,
      updatedAt: now,
    });

    // settle bets of the round that just ended
    const roundToSettle = String(currentRoundId); // bets used this roundId
    await settleBetsForRound(roundToSettle, rollData);

    // create new round
    const nextRound = Date.now() + 25000;
    await initRoundDoc(nextRound);
    console.log(`🎲 Rolled: ${rollData.dice.join(",")} = ${rollData.total} (${rollData.result}). Next roll at ${new Date(nextRound).toLocaleTimeString()}`);
  } catch (err) {
    console.error("Roll error:", err);
  }
}

function startRolling() {
  // initialize current round doc
  initRoundDoc().then(() => {
    // schedule: first roll after ~25s, then every 25s
    setTimeout(() => {
      performRoll();
      setInterval(performRoll, 25000);
    }, 25000);
    console.log("🎲 Roll engine started (25s interval).");
  });
}

module.exports = { startRolling, randomDice };

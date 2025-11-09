const { admin } = require("./firebaseAdmin");
const db = () => admin.firestore();

let timer = null;

function randomDice(){
  return Math.floor(Math.random() * 6) + 1;
}

function decideResult(sum){
  return sum >= 8 ? "Tài" : "Xỉu";
}

function startRolling(intervalMs = 25000){
  // write initial nextRoll
  scheduleOnce(intervalMs);
  if (timer) clearInterval(timer);
  timer = setInterval(() => scheduleOnce(intervalMs), intervalMs);
  console.log("Roll engine started, interval:", intervalMs);
}

async function scheduleOnce(intervalMs){
  const now = Date.now();
  const nextRollAt = now + intervalMs;
  // write nextRoll placeholder to allow clients to count down
  await db().doc("game/current").set({
    nextRoll: nextRollAt,
    timestamp: now,
    status: "waiting"
  }, { merge: true });

  // wait interval then do roll
  setTimeout(async () => {
    const d1 = randomDice();
    const d2 = randomDice();
    const sum = d1 + d2;
    const result = decideResult(sum);
    const rollData = {
      dice1: d1,
      dice2: d2,
      sum,
      result,
      timestamp: Date.now(),
      nextRoll: Date.now() + intervalMs
    };
    // Save roll result
    await db().doc("game/current").set(rollData, { merge: true });

    // apply bets: read bets collection where processed==false, settle them
    await settleBets(rollData);
  }, intervalMs);
}

async function settleBets(rollData){
  const betsSnap = await db().collection("bets").where("processed", "==", false).get();
  const batch = db().batch();
  const adminRef = db().collection("system").doc("stats");
  let totalPayout = 0;
  betsSnap.forEach(docSnap => {
    const b = docSnap.data();
    const docRef = docSnap.ref;
    let win = false;
    if (b.choice === rollData.result) win = true;
    const payout = win ? b.amount * (b.odds || 2) : 0; // default odds 2x
    // update user balance
    const userRef = db().collection("users").doc(b.uid);
    // mark bet processed
    batch.update(docRef, { processed: true, win, payout, result: rollData.result });
    // update user's balance (add payout, subtract nothing else since amount likely deducted at bet time)
    batch.set(userRef, { balance: admin.firestore.FieldValue.increment(payout) }, { merge: true });
    totalPayout += payout;
  });
  // commit
  if (!betsSnap.empty) await batch.commit();
  // store last roll stats
  await db().collection("game").doc("history").collection("rolls").add(rollData);
  // optionally update stats
  await adminRef.set({ lastRoll: rollData, updated: Date.now() }, { merge: true });
}

module.exports = { startRolling, settleBets };

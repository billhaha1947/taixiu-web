// /public/script.js
import { app, auth, db, onAuthStateChanged } from "./firebase.js";
import { doc, onSnapshot, collection, query, orderBy, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// UI
const balanceEl = document.getElementById("balance");
const countdownEl = document.getElementById("countdown");
const totalsEl = document.getElementById("totals");
const betInput = document.getElementById("bet");
const taiBtn = document.getElementById("tai");
const xiuBtn = document.getElementById("xiu");
const resultStatus = document.getElementById("resultStatus");
const leaderboardList = document.getElementById("leaderboardList");

const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");

const sndRoll = document.getElementById("sndRoll");
const sndWin = document.getElementById("sndWin");
const sndLose = document.getElementById("sndLose");

let currentUser = null;
let lastCombo = "";

// ensure auth: simple anonymous login fallback (or you can implement full email auth)
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    // read & display user balance
    fetchUserBalance(user.uid);
  } else {
    // redirect to login page or show anon (for now: redirect)
    window.location.href = "login.html";
  }
});

async function fetchUserBalance(uid) {
  const res = await fetch(`/api/admin/users`); // we'll use admin endpoint for leaderboard; separate user fetch via Firestore
  // better: read from Firestore doc using client SDK:
  import("./firebase.js").then(({db}) => {
    const userDoc = doc(db, "users", uid);
    onSnapshot(userDoc, s => {
      if (s.exists()) balanceEl.textContent = `Số dư: ${(s.data().balance || 0).toLocaleString()} VND`;
    });
  }).catch(()=>{});
}

// listen current round doc
onSnapshot(doc(db, "game", "current"), snap => {
  if (!snap.exists()) return;
  const data = snap.data();
  const nextRoll = data.nextRoll || Date.now();
  const now = Date.now();
  const secLeft = Math.max(0, Math.floor((nextRoll - now) / 1000));
  countdownEl.textContent = `⏳ Còn ${secLeft}s`;
  totalsEl.textContent = `Tổng cược — Tài: ${data.totalBetTai||0} | Xỉu: ${data.totalBetXiu||0}`;

  // if lastResult changed -> animate dice
  if (data.lastResult && data.lastResult.total) {
    const combo = data.lastResult.dice.join(",");
    if (combo !== lastCombo) {
      lastCombo = combo;
      playRollAnimationAndShow(data.lastResult);
      refreshLeaderboard();
      loadRecentHistory();
    }
  }
});

// play 3D roll animation then show result
function playRollAnimationAndShow(lastResult) {
  sndRoll.currentTime = 0; sndRoll.play().catch(()=>{});
  const dice1 = document.getElementById("dice1");
  const dice2 = document.getElementById("dice2");

  // pick rotations mapping for faces 1..6
  const rot = [
    [0,0], [0,180], [0,-90], [0,90], [90,0], [-90,0]
  ];

  // start with big spins
  dice1.style.transition = "transform 1s cubic-bezier(.22,.9,.3,1)";
  dice2.style.transition = "transform 1s cubic-bezier(.22,.9,.3,1)";
  dice1.style.transform = `rotateX(${720}deg) rotateY(${720}deg)`;
  dice2.style.transform = `rotateX(${900}deg) rotateY(${900}deg)`;

  // after spin, set to face
  setTimeout(()=> {
    const f1 = lastResult.dice[0];
    const f2 = lastResult.dice[1];
    const r1 = rot[f1-1], r2 = rot[f2-1];
    // gentle rotation to face + small bounce
    dice1.style.transform = `rotateX(${r1[0]}deg) rotateY(${r1[1]}deg)`;
    dice2.style.transform = `rotateX(${r2[0]}deg) rotateY(${r2[1]}deg)`;
    // sound result
    const win = (lastResult.result === "Tài" && lastResult) ? true : true; // not per-user here
    // for overall sound, just play roll done; win/lose per-player handled elsewhere
    setTimeout(()=>{ sndRoll.pause(); }, 500);

    resultStatus.textContent = `KQ: ${lastResult.dice.join(" + ")} = ${lastResult.total} → ${lastResult.result}`;
    // play generic chime (no per-user check)
    sndWin.currentTime = 0; sndWin.play().catch(()=>{});
  }, 1000);
}

// place bet via API (send roundId from game/current)
async function placeBet(choice) {
  const amount = parseInt(betInput.value);
  if (!amount || amount <= 0) return alert("Nhập số tiền hợp lệ");
  // read current round
  const snap = await (await fetch("/api/game/current")).json();
  const roundId = snap.roundId;
  if (!roundId) return alert("Round chưa sẵn sàng");

  // call server
  const res = await fetch("/api/game/bet", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ uid: currentUser.uid, choice, amount, roundId })
  });
  const j = await res.json();
  if (j.error) return alert("Lỗi: "+j.error);
  alert("Đã đặt cược!");
}

// leader board refresh
async function refreshLeaderboard(){
  try{
    const res = await fetch("/api/admin/users");
    const list = await res.json();
    leaderboardList.innerHTML = list.map(u => `<li>${u.email||u.id} — ${ (u.balance||0).toLocaleString() }</li>`).join("");
  }catch(e){}
}

// chat via Firestore client
chatSend.addEventListener("click", async ()=>{
  const text = chatInput.value.trim();
  if (!text) return;
  // add to server route (or directly to Firestore)
  await fetch("/api/game/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ uid: currentUser.uid, name: currentUser.email || "User", text })});
  chatInput.value = "";
});

// listen chat realtime
import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js").then(({ collection, query, orderBy, onSnapshot })=>{
  const q = query(collection(db, "chats"), orderBy("ts", "asc"));
  onSnapshot(q, snap => {
    chatBox.innerHTML = snap.docs.map(d => {
      const x = d.data(); return `<div><b>${x.name}:</b> ${x.text}</div>`;
    }).join("");
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}).catch(()=>{});

// bind buttons
taiBtn.addEventListener("click", ()=>placeBet("Tài"));
xiuBtn.addEventListener("click", ()=>placeBet("Xỉu"));

// initial loads
refreshLeaderboard();

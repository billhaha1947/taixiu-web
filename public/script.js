// public/script.js
import { auth, db, onAuthStateChanged } from "./firebase.js";
import { doc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const diceA = document.getElementById("diceA");
const diceB = document.getElementById("diceB");
const btnTai = document.getElementById("btnTai");
const btnXiu = document.getElementById("btnXiu");
const betInput = document.getElementById("bet");
const resultText = document.getElementById("resultText");
const balanceEl = document.getElementById("balance");
const leaderboardEl = document.getElementById("leaderboard");
const sumTai = document.getElementById("sumTai");
const sumXiu = document.getElementById("sumXiu");

let currentUser = null;

onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) {
    // load balance from firestore user doc
    loadBalance();
  } else {
    // redirect to login
    if (!window.location.pathname.includes("login.html")) {
      window.location.href = "login.html";
    }
  }
});

async function loadBalance(){
  const snap = await getDoc(doc(db, "users", currentUser.uid));
  const bal = snap.exists() ? (snap.data().balance || 0) : 0;
  balanceEl.innerText = `Số dư: ${bal.toLocaleString()} VND`;
}

async function placeBet(choice){
  if (!currentUser) return alert("Đăng nhập để cược");
  const amount = parseInt(betInput.value || "0", 10);
  if (!amount || amount <= 0) return alert("Nhập số tiền hợp lệ");
  const res = await fetch("/api/game/bet", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ uid: currentUser.uid, choice, amount })
  });
  const j = await res.json();
  if (j.error) alert("Lỗi: " + j.error);
  else {
    alert("Đặt cược thành công");
    loadBalance();
  }
}

btnTai.addEventListener("click", () => placeBet("Tài"));
btnXiu.addEventListener("click", () => placeBet("Xỉu"));

// realtime listen to game/current
const currentDoc = doc(db, "game", "current");
onSnapshot(currentDoc, (snap) => {
  if (!snap.exists()) return;
  const d = snap.data();
  if (d.dice1) {
    diceA.src = `images/dice3d/${String(d.dice1).padStart(2,'0')}.png`;
    diceB.src = `images/dice3d/${String(d.dice2).padStart(2,'0')}.png`;
    resultText.innerText = `${d.sum} (${d.result})`;
  }
  // nextRoll countdown
  if (d.nextRoll) {
    startCountdown(d.nextRoll);
  }
});

// leader board
async function loadTop(){
  const res = await fetch("/api/game/top");
  const j = await res.json();
  leaderboardEl.innerHTML = "";
  j.forEach(u => {
    const li = document.createElement("li");
    li.innerText = `${u.email || u.id}: ${ (u.balance||0).toLocaleString() }`;
    leaderboardEl.appendChild(li);
  });
}
loadTop();

let countdownTimer = null;
function startCountdown(nextTs){
  clearInterval(countdownTimer);
  let sec = Math.max(0, Math.floor((nextTs - Date.now())/1000));
  const top = document.getElementById("topStats");
  top.querySelector("span#sumTai"); // keep layout
  countdownTimer = setInterval(() => {
    sec--;
    if (sec <= 0) {
      clearInterval(countdownTimer);
      top.querySelector("#sumTai");
    } else {
      top.innerHTML = `⏳ Đang tải... Còn ${sec}s để đặt cược`;
    }
  }, 1000);
}

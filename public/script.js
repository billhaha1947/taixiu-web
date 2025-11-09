// ====== script.js ======
import { db, auth } from "./firebase.js";
import { doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==== ELEMENTS ====
const balanceEl = document.getElementById("balance");
const betInput = document.getElementById("bet");
const taiBtn = document.getElementById("tai");
const xiuBtn = document.getElementById("xiu");
const historyEl = document.getElementById("history");

// Countdown hiển thị
const countdownEl = document.createElement("div");
countdownEl.id = "countdown";
countdownEl.style.marginTop = "15px";
countdownEl.style.color = "yellow";
countdownEl.style.fontSize = "18px";
countdownEl.style.fontWeight = "bold";
document.querySelector("main")?.appendChild(countdownEl);

// ==== CẬP NHẬT SỐ DƯ ====
async function updateBalance() {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const balance = snap.data().balance || 0;
    balanceEl.textContent = `💰 Số dư: ${balance.toLocaleString()} VND`;
  }
}

// ==== GỬI CƯỢC ====
async function placeBet(choice) {
  const betAmount = parseInt(betInput.value);
  if (isNaN(betAmount) || betAmount <= 0) return alert("❗Nhập số tiền hợp lệ");

  const user = auth.currentUser;
  if (!user) return alert("Vui lòng đăng nhập lại");

  const res = await fetch("/api/game/bet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid: user.uid, choice, amount: betAmount }),
  });

  const data = await res.json();
  alert(data.message || "Đặt cược thành công!");
  updateBalance();
}

// ==== ANIMATION XÚC XẮC ====
function animateDice(resultText) {
  const diceWrap = document.createElement("div");
  diceWrap.classList.add("dice-animation");
  diceWrap.innerHTML = `
    <div class="dice-row">
      <div class="dice" id="dice1">🎲</div>
      <div class="dice" id="dice2">🎲</div>
    </div>
    <div class="result-text">${resultText}</div>
  `;
  document.body.appendChild(diceWrap);

  // Lắc xúc xắc 1 giây
  const diceEls = diceWrap.querySelectorAll(".dice");
  diceEls.forEach(dice => dice.classList.add("shake"));

  // Dừng animation sau 1s, giữ 1.5s, rồi biến mất
  setTimeout(() => {
    diceEls.forEach(dice => dice.classList.remove("shake"));
  }, 1000);
  setTimeout(() => diceWrap.remove(), 2500);
}

// ==== ĐẾM NGƯỢC ====
let countdownTimer;
function startCountdown(seconds) {
  clearInterval(countdownTimer);
  let time = seconds;

  if (time < 0) time = 0;
  countdownEl.textContent = `⏳ Còn ${time}s để đặt cược`;

  countdownTimer = setInterval(() => {
    time--;
    if (time <= 0) {
      countdownEl.textContent = "🎲 Đang tung xúc xắc...";
      clearInterval(countdownTimer);
    } else {
      countdownEl.textContent = `⏳ Còn ${time}s để đặt cược`;
    }
  }, 1000);
}

// ==== FIRESTORE REALTIME ====
let lastSum = "";
onSnapshot(doc(db, "game", "current"), (snap) => {
  if (!snap.exists()) return;
  const data = snap.data();
  const { dice1, dice2, sum, result, nextRoll } = data;

  // Nếu kết quả mới khác kết quả cũ thì mới cập nhật animation
  const combo = `${dice1}+${dice2}`;
  if (combo !== lastSum) {
    lastSum = combo;

    // Hiện lịch sử mới nhất
    historyEl.innerHTML = `
      🎲 ${dice1} + ${dice2} = ${sum} (${result})<br>
      <small>${new Date().toLocaleTimeString()}</small>
    ` + historyEl.innerHTML;

    // Gọi animation
    animateDice(`${dice1} + ${dice2} = ${sum} (${result})`);
  }

  // Cập nhật countdown
  const now = Date.now();
  const timeLeft = Math.floor((nextRoll - now) / 1000);
  startCountdown(timeLeft);
});

// ==== NÚT BẤM ====
taiBtn.addEventListener("click", () => {
  taiBtn.classList.add("bet-selected");
  xiuBtn.classList.remove("bet-selected");
  placeBet("Tài");
});

xiuBtn.addEventListener("click", () => {
  xiuBtn.classList.add("bet-selected");
  taiBtn.classList.remove("bet-selected");
  placeBet("Xỉu");
});

// ==== INIT ====
updateBalance();

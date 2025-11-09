// ====== script.js ======
import { db, auth, signOut } from "./firebase.js";
import { doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// HTML elements
const balanceEl = document.getElementById("balance");
const betInput = document.getElementById("bet");
const taiBtn = document.getElementById("tai");
const xiuBtn = document.getElementById("xiu");
const historyEl = document.getElementById("history");
const countdownEl = document.createElement("div");

// Thêm đồng hồ đếm ngược
countdownEl.id = "countdown";
countdownEl.style.marginTop = "15px";
countdownEl.style.color = "yellow";
countdownEl.style.fontSize = "18px";
countdownEl.style.fontWeight = "bold";
document.querySelector("main")?.appendChild(countdownEl);

// === Cập nhật số dư ===
async function updateBalance() {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const balance = snap.data().balance || 0;
    balanceEl.textContent = `Số dư: ${balance.toLocaleString()} VND`;
  }
}

// === Gửi cược ===
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

// === Animation xúc xắc ===
function animateDice(result) {
  const diceEl = document.createElement("div");
  diceEl.classList.add("dice-animation");
  diceEl.innerHTML = `
    <div class="dice">🎲</div>
    <div class="result-text">${result}</div>
  `;
  document.body.appendChild(diceEl);

  // Animation
  diceEl.animate(
    [
      { transform: "rotate(0deg) scale(1)", opacity: 1 },
      { transform: "rotate(720deg) scale(1.3)", opacity: 1 },
      { transform: "rotate(1080deg) scale(1)", opacity: 0 }
    ],
    { duration: 2500, easing: "ease-in-out" }
  );

  setTimeout(() => diceEl.remove(), 2600);
}

// === Theo dõi roll realtime từ server ===
onSnapshot(doc(db, "game", "current"), (snap) => {
  if (!snap.exists()) return;
  const data = snap.data();

  const { dice1, dice2, sum, result, nextRoll } = data;
  const now = Date.now();
  const timeLeft = Math.floor((nextRoll - now) / 1000);

  // Hiện kết quả
  historyEl.innerHTML = `
    🎲 ${dice1} + ${dice2} = ${sum} (${result})<br>
    <small>${new Date().toLocaleTimeString()}</small>
  ` + historyEl.innerHTML;

  // Gọi animation xúc xắc
  animateDice(`${dice1} + ${dice2} = ${sum} (${result})`);

  // Cập nhật đếm ngược
  startCountdown(timeLeft);
});

// === Đếm ngược thời gian đến lần tung tiếp theo ===
let countdownTimer;
function startCountdown(seconds) {
  clearInterval(countdownTimer);
  let time = seconds;

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

// === Nút bấm ===
taiBtn.addEventListener("click", () => placeBet("Tài"));
xiuBtn.addEventListener("click", () => placeBet("Xỉu"));

// Cập nhật khi vào trang
updateBalance();

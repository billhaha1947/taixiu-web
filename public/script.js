// ====== 🔧 DEBUG CONSOLE HIỂN THỊ TRÊN MÀN HÌNH (cho điện thoại) ======
(function () {
  const logBox = document.createElement("div");
  logBox.style.position = "fixed";
  logBox.style.bottom = "0";
  logBox.style.left = "0";
  logBox.style.right = "0";
  logBox.style.maxHeight = "40vh";
  logBox.style.overflowY = "auto";
  logBox.style.background = "rgba(0,0,0,0.8)";
  logBox.style.color = "lime";
  logBox.style.fontSize = "12px";
  logBox.style.zIndex = 9999;
  logBox.style.padding = "6px";
  logBox.style.fontFamily = "monospace";
  document.body.appendChild(logBox);

  const print = (type, ...args) => {
    const msg = document.createElement("div");
    msg.textContent = `[${type}] ${args
      .map(a => (typeof a === "object" ? JSON.stringify(a) : a))
      .join(" ")}`;
    logBox.appendChild(msg);
    logBox.scrollTop = logBox.scrollHeight;
  };

  const origLog = console.log;
  const origErr = console.error;
  const origWarn = console.warn;

  console.log = (...a) => {
    origLog(...a);
    print("LOG", ...a);
  };
  console.error = (...a) => {
    origErr(...a);
    print("ERR", ...a);
  };
  console.warn = (...a) => {
    origWarn(...a);
    print("WARN", ...a);
  };
})();

// ====== 🎲 GAME TÀI XỈU SCRIPT ======

const diceEls = document.querySelectorAll(".dice img");
const betInput = document.getElementById("bet");
const btnTai = document.getElementById("bet-tai");
const btnXiu = document.getElementById("bet-xiu");
const resultEl = document.getElementById("result");
const balanceEl = document.getElementById("balance");

let currentGame = null;
let bets = { tai: 0, xiu: 0 };
let balance = 10000;

// Lấy trạng thái game từ server
async function fetchGameState() {
  try {
    const res = await fetch("/api/game/state");
    const data = await res.json();
    currentGame = data;
    console.log("🌀 Game state:", data);
    updateUI();
  } catch (e) {
    console.error("❌ Lỗi fetchGameState:", e);
  }
}

// Cập nhật giao diện
function updateUI() {
  if (!currentGame) return;
  document.getElementById("total-bet").textContent = `Tổng cược — Tài: ${bets.tai} | Xỉu: ${bets.xiu}`;
  resultEl.textContent = `Kết quả: ${currentGame.result || "-"} `;
  balanceEl.textContent = `Số dư: ${balance}`;
}

// Gửi cược
async function placeBet(type) {
  const amount = parseInt(betInput.value);
  if (isNaN(amount) || amount <= 0) {
    alert("Nhập số tiền hợp lệ!");
    return;
  }

  if (balance < amount) {
    alert("Không đủ số dư!");
    return;
  }

  try {
    const res = await fetch("/api/game/bet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount }),
    });
    const data = await res.json();
    console.log("📤 Đặt cược:", data);

    if (data.success) {
      balance -= amount;
      bets[type] += amount;
      updateUI();
    } else {
      alert("Đặt cược thất bại!");
    }
  } catch (e) {
    console.error("⚠️ Lỗi gửi cược:", e);
  }
}

// Xử lý kết quả xúc xắc
function updateDice(dice) {
  diceEls[0].src = `images/dice1.png`;
  diceEls[1].src = `images/dice2.png`;
  if (dice && dice.length === 2) {
    diceEls[0].src = `images/dice${dice[0]}.png`;
    diceEls[1].src = `images/dice${dice[1]}.png`;
  }
}

// Auto cập nhật mỗi 5s
setInterval(fetchGameState, 5000);

// Gán sự kiện
btnTai.onclick = () => placeBet("tai");
btnXiu.onclick = () => placeBet("xiu");

// Lấy trạng thái ban đầu
fetchGameState();

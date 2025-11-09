const API_BASE = "https://taixiu-web-frxx.onrender.com/api";
const userEmail = document.getElementById("userEmail");
const balanceEl = document.getElementById("balance");
const historyEl = document.getElementById("history");
const resultBox = document.getElementById("resultBox");

let currentUser = null;

// Kiểm tra đăng nhập
auth.onAuthStateChanged(async (user) => {
  if (!user) return (location.href = "login.html");
  currentUser = user;
  userEmail.textContent = `Xin chào: ${user.email}`;

  // Lấy số dư
  const doc = await db.collection("users").doc(user.uid).get();
  balanceEl.textContent = doc.data()?.balance || 0;

  loadHistory();
});

async function loadHistory() {
  try {
    const res = await fetch(`${API_BASE}/history`);
    const data = await res.json();
    historyEl.innerHTML = data.map(
      h => `<li>${h.choice} - ${h.result} (${h.bet})</li>`
    ).join("");
  } catch {
    historyEl.innerHTML = "<li>Lỗi khi tải lịch sử!</li>";
  }
}

async function roll(choice) {
  const bet = Number(document.getElementById("bet").value);
  if (!bet) return alert("Nhập số tiền cược!");

  try {
    const res = await fetch(`${API_BASE}/roll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.uid, bet, choice }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    resultBox.innerHTML = `
      🎲 Kết quả: ${data.dice.join(", ")} (${data.result})<br>
      ${data.win ? "Bạn thắng!" : "Bạn thua!"}<br>
      Số dư mới: ${data.newBalance}
    `;

    balanceEl.textContent = data.newBalance;
    loadHistory();
  } catch (e) {
    console.error(e);
    resultBox.innerHTML = "Lỗi khi quay!";
  }
}

document.getElementById("taiBtn").onclick = () => roll("Tài");
document.getElementById("xiuBtn").onclick = () => roll("Xỉu");

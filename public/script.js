import { auth, db, signOut, doc, getDoc, setDoc } from "./firebase.js";

const balanceEl = document.getElementById("balance");
const logoutBtn = document.getElementById("logoutBtn");
const taiBtn = document.getElementById("taiBtn");
const xiuBtn = document.getElementById("xiuBtn");
const betAmountEl = document.getElementById("betAmount");

async function updateBalanceDisplay() {
  const user = auth.currentUser;
  if (!user) return;
  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    balanceEl.textContent = "Số dư: " + snap.data().balance.toLocaleString() + " VND";
  }
}

async function play(betType) {
  const user = auth.currentUser;
  if (!user) return;

  const amount = parseInt(betAmountEl.value);
  if (!amount || amount <= 0) return alert("⚠️ Nhập số tiền hợp lệ!");

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const data = snap.data();
  let balance = data.balance;

  if (balance < amount) return alert("❌ Không đủ tiền!");

  // Giả lập xúc xắc
  const dice = [1, 2, 3, 4, 5, 6].map(() => Math.floor(Math.random() * 6) + 1);
  const total = dice.reduce((a, b) => a + b, 0);
  const result = total >= 11 ? "Tài" : "Xỉu";

  let msg = `🎲 Kết quả: ${dice.join(", ")} = ${total} → ${result}`;

  if (betType === result) {
    balance += amount;
    msg += "\n✅ Bạn thắng!";
  } else {
    balance -= amount;
    msg += "\n❌ Bạn thua!";
  }

  await setDoc(userRef, { ...data, balance });
  alert(msg);
  updateBalanceDisplay();
}

taiBtn.addEventListener("click", () => play("Tài"));
xiuBtn.addEventListener("click", () => play("Xỉu"));
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

updateBalanceDisplay();

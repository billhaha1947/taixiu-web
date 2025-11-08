const API_URL = window.location.origin; // auto Render link

const rollBtn = document.getElementById("rollBtn");
const resultBox = document.getElementById("result");
const historyBox = document.getElementById("history");

async function fetchHistory() {
  try {
    const res = await fetch(`${API_URL}/api/history`);
    const data = await res.json();
    historyBox.innerHTML = data
      .map(r => `<li>${r.result} (${r.dice1},${r.dice2},${r.dice3}) - Tổng: ${r.sum}</li>`)
      .join("");
  } catch {
    historyBox.innerHTML = "<li>Lỗi khi tải lịch sử!</li>";
  }
}

async function rollDice() {
  rollBtn.disabled = true;
  resultBox.innerHTML = "🎲 Đang quay...";
  try {
    const res = await fetch(`${API_URL}/api/roll`);
    const data = await res.json();
    resultBox.innerHTML = `
      <p>Kết quả: <strong>${data.result}</strong></p>
      <p>Xúc xắc: ${data.dice1}, ${data.dice2}, ${data.dice3} (Tổng: ${data.sum})</p>
    `;
    await fetchHistory();
  } catch {
    resultBox.innerHTML = "Lỗi khi quay!";
  }
  rollBtn.disabled = false;
}

rollBtn.addEventListener("click", rollDice);
fetchHistory();

let timer = 25;
let interval;
let balance = 100000;
let rolling = false;

const diceEls = [document.getElementById("dice1"), document.getElementById("dice2"), document.getElementById("dice3")];
const resultEl = document.getElementById("result");
const timerEl = document.getElementById("timer");
const balanceEl = document.getElementById("balance");

balanceEl.textContent = balance.toLocaleString();

function rollDice() {
  if (rolling) return;
  rolling = true;
  resultEl.textContent = "Đang lăn xúc xắc...";
  diceEls.forEach(dice => {
    dice.style.transform = "rotate(720deg)";
    dice.style.backgroundImage = "";
  });

  setTimeout(() => {
    const values = [rand(), rand(), rand()];
    const sum = values.reduce((a, b) => a + b, 0);
    values.forEach((v, i) => diceEls[i].style.backgroundImage = `url('https://raw.githubusercontent.com/ArfatSalman/dice-imgs/main/${v}.png')`);
    resultEl.textContent = `Kết quả: ${sum} (${sum >= 11 ? "Tài" : "Xỉu"})`;
    rolling = false;
  }, 1500);
}

function rand() {
  return Math.floor(Math.random() * 6) + 1;
}

function startAutoRoll() {
  interval = setInterval(() => {
    rollDice();
    timer = 25;
  }, 25000);
  setInterval(() => {
    timer--;
    if (timer <= 0) timer = 25;
    timerEl.textContent = timer;
  }, 1000);
}

startAutoRoll();

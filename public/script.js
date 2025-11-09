// script.js (module)
import {
  auth, db, onSnapshot, doc, collection, addDoc, query, orderBy, limit, getDoc,
  signOut
} from "./firebase.js";

/* ---------- UI refs ---------- */
const balanceEl = document.getElementById("balance");
const betInput = document.getElementById("bet");
const taiBtn = document.getElementById("tai");
const xiuBtn = document.getElementById("xiu");
const historyEl = document.getElementById("history");
const countdownEl = document.getElementById("countdown");
const totalsEl = document.getElementById("totals");
const leaderboardEl = document.getElementById("leaderboard");
const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const logoutBtn = document.getElementById("logoutBtn");
const sumText = document.getElementById("sumText");

/* ---------- Basic state ---------- */
let nextRollTS = Date.now() + 25000;
let countdownTimer = null;
let totals = { tai: 0, xiu: 0 };

/* ---------- Authentication watch ----------
   If you don't want auth, adapt to anonymous or local user.
*/
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
onAuthStateChanged(auth, async user => {
  if (!user) {
    // redirect to login if not using anonymous flow
    // window.location.href = "login.html";
    balanceEl.textContent = "Số dư: - (chưa đăng nhập)";
    logoutBtn.classList.add("hidden");
    return;
  }
  logoutBtn.classList.remove("hidden");
  updateBalanceUI(user.uid);
});

/* ---------- Balance UI (from users collection) ---------- */
async function updateBalanceUI(uid) {
  const uref = doc(db, "users", uid);
  const snap = await getDoc(uref);
  if (snap.exists()) {
    const bal = snap.data().balance || 0;
    balanceEl.textContent = `Số dư: ${Number(bal).toLocaleString()} VND`;
  } else {
    balanceEl.textContent = `Số dư: 0 VND`;
  }
}

/* ---------- Chat ---------- */
chatForm.addEventListener("submit", async e => {
  e.preventDefault();
  const txt = chatInput.value.trim();
  if (!txt) return;
  const user = auth.currentUser;
  await addDoc(collection(db, "chatMessages"), {
    text: txt,
    uid: user ? user.uid : "guest",
    email: user ? user.email : "guest",
    ts: serverTimestamp()
  });
  chatInput.value = "";
});

onSnapshot(collection(db, "chatMessages"), snap => {
  chatBox.innerHTML = "";
  snap.docs.slice(-50).forEach(d => {
    const data = d.data();
    const el = document.createElement("div");
    el.className = "chat-line";
    const who = data.email ? data.email.split("@")[0] : data.uid;
    el.innerHTML = `<small style="opacity:.6">${who}:</small> ${escapeHtml(data.text)}`;
    chatBox.appendChild(el);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});

/* ---------- Leaderboard ---------- */
async function listenLeaderboard() {
  const q = query(collection(db, "users"), orderBy("balance", "desc"), limit(10));
  onSnapshot(q, snap => {
    leaderboardEl.innerHTML = "";
    snap.forEach((d) => {
      const data = d.data();
      const li = document.createElement("li");
      li.textContent = `${data.email ? data.email.split("@")[0] : d.id} — ${Number(data.balance||0).toLocaleString()}`;
      leaderboardEl.appendChild(li);
    });
  });
}
listenLeaderboard();

/* ---------- Totals ---------- */
function updateTotalsUI() {
  totalsEl.textContent = `Tổng cược — Tài: ${totals.tai} | Xỉu: ${totals.xiu}`;
}

/* ---------- Betting (call server API) ---------- */
async function placeBet(choice) {
  const amount = parseInt(betInput.value);
  if (!amount || amount <= 0) return alert("Nhập số tiền hợp lệ");
  const user = auth.currentUser;
  if (!user) return alert("Vui lòng đăng nhập");
  try {
    const res = await fetch("/api/game/bet", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ uid: user.uid, choice, amount })
    });
    const j = await res.json();
    alert(j.message || "Đặt cược OK");
  } catch (err) {
    console.error(err);
    alert("Lỗi gửi cược");
  }
}
taiBtn.addEventListener("click", ()=>placeBet("Tài"));
xiuBtn.addEventListener("click", ()=>placeBet("Xỉu"));

/* ---------- Logout ---------- */
logoutBtn.addEventListener("click", async ()=>{
  try { await signOut(auth); window.location.reload(); } catch(e){console.error(e)}
});

/* ---------- Firestore game/current listener ----------
   Expect doc 'game/current' with { dice: [1,2,3], sum, result('Tài'|'Xỉu'), nextRoll (ts), totals }
*/
onSnapshot(doc(db, "game", "current"), snap => {
  if (!snap.exists()) return;
  const data = snap.data();
  if (data.nextRoll) nextRollTS = data.nextRoll;
  if (data.totals) { totals = data.totals; updateTotalsUI(); }
  if (data.dice) {
    // animate to result
    const sum = data.sum || (data.dice[0]+data.dice[1]+data.dice[2]);
    sumText.textContent = `Kết quả: ${data.dice.join(" + ")} = ${sum} (${data.result || "-"})`;
    addHistory(`${data.dice.join(" + ")} = ${sum} (${data.result || "-"})`);
    animateToDice(data.dice); // three.js animation to faces
  }
  startCountdown(Math.max(0, Math.floor((nextRollTS - Date.now())/1000)));
});

/* history helper */
function addHistory(text){
  const li=document.createElement("li");
  li.textContent = text + " — " + new Date().toLocaleTimeString();
  historyEl.insertBefore(li, historyEl.firstChild);
  if (historyEl.children.length>8) historyEl.removeChild(historyEl.lastChild);
}

/* ---------- Countdown ---------- */
function startCountdown(seconds) {
  clearInterval(countdownTimer);
  let t = seconds;
  countdownEl.textContent = `⏳ Còn ${t}s để đặt cược`;
  countdownTimer = setInterval(()=>{
    t--;
    if (t <= 0) {
      countdownEl.textContent = "🎲 Đang tung xúc xắc...";
      clearInterval(countdownTimer);
    } else {
      countdownEl.textContent = `⏳ Còn ${t}s để đặt cược`;
    }
  },1000);
}

/* ---------- Three.js dice scene ----------
   We create three cubes, each with 6 textures (faces).
   We provide rollDice() to spin randomly and tween to target faces.
*/
let scene, camera, renderer, diceGroup, dMeshes = [];

function initThreeDice(){
  const container = document.getElementById("dice-container");
  const w = container.clientWidth || 240;
  const h = container.clientHeight || 240;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, w/h, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
  renderer.setSize(w,h);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 0.9);
  light.position.set(5,10,7);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));

  diceGroup = new THREE.Group();
  scene.add(diceGroup);

  const faceImgs = [
    'dice-face-1.png','dice-face-2.png','dice-face-3.png','dice-face-4.png','dice-face-5.png','dice-face-6.png'
  ];
  // NOTE: Put dice-face-N.png in /public (or change paths). Fallback to simple colored faces if imgs missing.
  const loader = new THREE.TextureLoader();
  const mats = faceImgs.map(f => new THREE.MeshStandardMaterial({ map: loader.load(f), roughness:0.6 }));

  // create 3 dice
  for(let i=0;i<3;i++){
    const geom = new THREE.BoxGeometry(1,1,1);
    const die = new THREE.Mesh(geom, mats);
    die.position.x = (i-1)*1.4;
    die.castShadow = true;
    diceGroup.add(die);
    dMeshes.push(die);
  }

  camera.position.z = 5;
  camera.position.y = 1;

  animateThree();
}

function animateThree(){
  requestAnimationFrame(animateThree);
  // slow floating
  const t = Date.now()*0.001;
  diceGroup.rotation.y = t * 0.3;
  dMeshes.forEach((m,i)=>{
    m.rotation.x += 0.002;
    m.rotation.z += 0.002;
  });
  renderer.render(scene, camera);
}

/* Utility: rotate each die to show target face (1..6)
   We map face -> rotation (approx)
*/
const faceRotations = {
  1: {x:0, y:0},
  2: {x:0, y:Math.PI/2},
  3: {x:Math.PI/2, y:0},
  4: {x:-Math.PI/2, y:0},
  5: {x:0, y:-Math.PI/2},
  6: {x:Math.PI, y:0}
};

function animateToDice(targetArr){
  // quick spin animation then snap to target faces
  dMeshes.forEach((m, idx) => {
    // random spin tween
    const rx = Math.random()*Math.PI*6;
    const ry = Math.random()*Math.PI*6;
    const rz = Math.random()*Math.PI*6;
    // duration ~ 2s
    const duration = 1900 + Math.random()*400;
    const start = Date.now();
    const from = {x:m.rotation.x, y:m.rotation.y, z:m.rotation.z};
    const toFace = targetArr[idx] || 1;
    const target = faceRotations[toFace];
    function step(){
      const now = Date.now();
      const p = Math.min(1, (now-start)/duration);
      // easing
      const e = (--p)*p*p+1;
      m.rotation.x = from.x + (rx*(1-e)) + target.x * e;
      m.rotation.y = from.y + (ry*(1-e)) + target.y * e;
      m.rotation.z = from.z + (rz*(1-e));
      if ((now-start) < duration) requestAnimationFrame(step);
    }
    step();
  });
}

/* ---------- auto roll trigger (optionally call server) ---------- */
function clientRequestRoll(){
  // call server endpoint to roll and write to Firestore or return result
  fetch('/api/roll', { method:'POST' }).catch(err => {
    // if server not available, we can simulate locally (dev)
    console.warn('roll api failed', err);
  });
}

// every 25s, request server roll
setInterval(()=> {
  clientRequestRoll();
}, 25000);

/* ---------- init ---------- */
window.addEventListener("load", ()=> {
  initThreeDice();
  // start countdown from 25 if no data
  startCountdown(25);
});

/* ---------- small helpers ---------- */
function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

import { serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// public/login.js
import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");

btnRegister.addEventListener("click", async () => {
  try {
    const email = emailEl.value;
    const pw = passEl.value;
    const res = await createUserWithEmailAndPassword(auth, email, pw);
    const uid = res.user.uid;
    // create user doc with default balance
    await setDoc(doc(db, "users", uid), { email, balance: 100000 });
    alert("Đăng ký thành công");
    window.location.href = "index.html";
  } catch(e){
    alert("Lỗi đăng ký: " + e.message);
  }
});

btnLogin.addEventListener("click", async () => {
  try {
    const email = emailEl.value;
    const pw = passEl.value;
    await signInWithEmailAndPassword(auth, email, pw);
    window.location.href = "index.html";
  } catch(e){
    alert("Lỗi đăng nhập: " + e.message);
  }
});

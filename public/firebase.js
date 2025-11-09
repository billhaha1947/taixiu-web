// ===== FIREBASE CONFIG =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// === Dán config Firebase của m vào đây ===
const firebaseConfig = {
  apiKey: "AIzaSyBufJXyP6xLal_nJrfAWNHu4mr9D2gr2V8", // 👈 dán API key từ Firebase console
  authDomain: "taixiu-17879.firebaseapp.com",
  projectId: "taixiu-17879",
  storageBucket: "taixiu-17879.firebasestorage.app",
  messagingSenderId: "960406236533",
  appId: "1:960406236533:web:8eab1588e91089a4ff773c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check đăng nhập tự động
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Đã đăng nhập:", user.email);

    // Nếu là lần đầu đăng nhập thì tạo tài khoản Firestore
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, { balance: 100000, email: user.email }); // khởi tạo 100k VND
    }

    // Nếu đang ở login.html thì chuyển về index
    if (window.location.pathname.includes("login.html")) {
      window.location.href = "index.html";
    }
  } else {
    // Nếu chưa login thì chuyển sang trang login
    if (!window.location.pathname.includes("login.html")) {
      window.location.href = "login.html";
    }
  }
});

export { auth, db, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, doc, getDoc, setDoc };

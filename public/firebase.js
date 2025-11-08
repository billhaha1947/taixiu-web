// 🔥 Import các hàm cần thiết từ Firebase SDK (phiên bản mới nhất)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ⚙️ Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyBufJXp6xLaL_nJrfAWNHu4mr9D2g7zV8",
  authDomain: "taixiu-17879.firebaseapp.com",
  projectId: "taixiu-17879",
  storageBucket: "taixiu-17879.appspot.com", // ✅ sửa lại cho đúng
  messagingSenderId: "960406236533",
  appId: "1:960406236533:web:8eab1588e91089a4ff773c",
  measurementId: "G-F0F6RPHBW9",
};

// 🚀 Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🧩 Các hàm tiện ích (dùng cho login, register, update tiền,...)
export async function register(email, password, username) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", userCred.user.uid), {
    username,
    balance: 100000,
    role: "user",
  });
}

export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}

export async function getUserData(uid) {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.exists() ? docSnap.data() : null;
}

export async function updateBalance(uid, newBalance) {
  await updateDoc(doc(db, "users", uid), { balance: newBalance });
}

// Xuất auth & db cho các file khác dùng
export { auth, db };

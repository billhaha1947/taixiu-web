// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyBufJXp6xLaL_nJrfAWNHu4mr9D2g7zV8",
  authDomain: "taixiu-17879.firebaseapp.com",
  projectId: "taixiu-17879",
  storageBucket: "taixiu-17879.firebasestorage.app",
  messagingSenderId: "960406236533",
  appId: "1:960406236533:web:8eab1588e91089a4ff773c",
  measurementId: "G-F0F6RPHBW9"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Xuất db để các file khác (login, admin, index,...) có thể dùng
export { db };

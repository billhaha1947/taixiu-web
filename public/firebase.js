// Import Firebase SDK (phiên bản mới)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ⚠️ Thay các giá trị bên dưới bằng config của m trong Firebase Console → Project Settings → General → SDK setup & configuration
const firebaseConfig = {
  apiKey: "AIzaSyBufJXyP6xLal_nJrfAWNHu4mr9D2gr2V8",
  authDomain: "taixiu-17879.firebaseapp.com",
  projectId: "taixiu-17879",
  storageBucket: "taixiu-17879.firebasestorage.app",
  messagingSenderId: "960406236533",
  appId: "1:960406236533:web:8eab1588e91089a4ff773c"
};

// Khởi tạo Firebase App và Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Xuất để các file JS khác (như script.js, admin.js) dùng được
export { db, collection, addDoc, getDocs, query, orderBy, limit };

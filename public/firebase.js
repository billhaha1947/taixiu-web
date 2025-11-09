// /public/firebase.js  (ES module for browser)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Dán firebaseConfig của project vào đây ---
const firebaseConfig = {
apiKey : "AIzaSyBufJXyP6xLal_nJrfAWNHu4mr9D2gr2V8" , 
  authDomain : "taixiu-17879.firebaseapp.com" , 
  projectId : "taixiu-17879" , 
  storageBucket : "taixiu-17879.firebasestorage.app" , 
  messagingSenderId : "960406236533" , 
  appId : "1:960406236533:web:8eab1588e91089a4ff773c"
};

// Khởi tạo Firebase
const app = initializeApp ( firebaseConfig );
const analytics = getAnalytics ( ứng dụng );
Lưu ý: Tùy chọn này sử dụng SDK JavaScript dạng mô-đun , giúp giảm kích thước SDK.

Tìm hiểu thêm về Firebase cho web: Bắt đầu , Tài liệu tham khảo API SDK web , Mẫu


};
// --------------------------------------------

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, doc, getDoc, onAuthStateChanged };

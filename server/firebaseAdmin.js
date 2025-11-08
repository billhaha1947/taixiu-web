import admin from "firebase-admin";

try {
  // Lấy dữ liệu key từ biến môi trường
  const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

  // Kiểm tra xem Firebase đã khởi tạo chưa
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized successfully");
  }

  // Xuất Firestore để dùng ở các file khác
  const db = admin.firestore();
  export { db };
  
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error);
  throw new Error("Firebase initialization error");
}

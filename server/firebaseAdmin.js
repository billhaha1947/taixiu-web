// Fix lỗi Firebase OpenSSL decoder routines trên Render
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
process.env.NODE_OPTIONS = '--openssl-legacy-provider';

const admin = require("firebase-admin");

/**
 * Hàm thử parse service account key từ biến môi trường.
 * Cho phép đọc JSON trực tiếp hoặc bản base64 encode.
 */
function tryParseServiceAccount(envVal) {
  if (!envVal) return null;
  try {
    // Nếu là base64
    const maybeJson = Buffer.from(envVal, "base64").toString("utf8");
    return JSON.parse(maybeJson);
  } catch {
    // Không phải base64 thì thử parse JSON trực tiếp
  }
  try {
    return JSON.parse(envVal);
  } catch {
    return null;
  }
}

/**
 * Khởi tạo Firebase Admin SDK (chỉ khởi tạo 1 lần)
 */
function initFirebase() {
  if (admin.apps.length) return admin;

  const raw = process.env.FIREBASE_KEY || process.env.FIREBASE_KEY_BASE64;
  const serviceAccount = tryParseServiceAccount(raw);

  if (!serviceAccount) {
    console.warn("⚠️ FIREBASE_KEY not found or invalid. Firebase Admin not initialized.");
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin initialized successfully");
  return admin;
}

module.exports = { initFirebase, admin };

// Fix lỗi OpenSSL decoder trên Render / Alpine
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
process.env.NODE_OPTIONS = '--openssl-legacy-provider';

const admin = require("firebase-admin");

function tryParseServiceAccount(envVal) {
  if (!envVal) return null;
  // nếu là base64 encoded (tuỳ Render setup)
  try {
    const maybeJson = Buffer.from(envVal, 'base64').toString('utf8');
    const parsed = JSON.parse(maybeJson);
    return parsed;
  } catch (e) { /* not base64 */ }
  try {
    return JSON.parse(envVal);
  } catch (e) {
    return null;
  }
}

function initFirebase() {
  if (admin.apps.length) return admin;

  const raw = process.env.FIREBASE_KEY || process.env.FIREBASE_KEY_BASE64;
  const serviceAccount = tryParseServiceAccount(raw);

  if (!serviceAccount) {
    console.warn("⚠️  FIREBASE_KEY not found or invalid. Firebase Admin not initialized.");
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin initialized successfully");
  return admin;
}

module.exports = { initFirebase, admin };

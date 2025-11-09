<!-- public/firebase.js -->
<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBufJXyP6xLal_nJrfAWNHu4mr9D2gr2V8",
  authDomain: "taixiu-17879.firebaseapp.com",
  projectId: "taixiu-17879",
  storageBucket: "taixiu-17879.firebasestorage.app",
  messagingSenderId: "960406236533",
  appId: "1:960406236533:web:8eab1588e91089a4ff773c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, onAuthStateChanged, signOut };
</script>

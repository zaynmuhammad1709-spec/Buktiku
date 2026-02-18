// ===============================
// IMPORT FIREBASE
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";

import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

// ===============================
// FIREBASE CONFIG
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyBIaTx9x1_yz5N6t0uBp2eTc7tIBhMLRQA",
  authDomain: "buktiku-6e36b.firebaseapp.com",
  projectId: "buktiku-6e36b",
  storageBucket: "buktiku-6e36b.firebasestorage.app",
  messagingSenderId: "864927339878",
  appId: "1:864927339878:web:e11a53ac31e63c098c64a7",
  measurementId: "G-QBTSPKXLND"
};

// ===============================
// INIT FIREBASE
// ===============================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ===============================
// LOGIN GOOGLE
// ===============================
window.loginGoogle = function () {
  signInWithPopup(auth, provider)
    .then((result) => {
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert("Login gagal: " + error.message);
    });
};

// ===============================
// AUTO CHECK LOGIN
// ===============================
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Kalau di halaman login → pindah ke dashboard
    if (window.location.pathname.includes("login")) {
      window.location.href = "dashboard.html";
    }
  } else {
    // Kalau belum login tapi buka dashboard → balik ke login
    if (window.location.pathname.includes("dashboard")) {
      window.location.href = "index.html";
    }
  }
});

// ===============================
// LOGOUT
// ===============================
window.logoutUser = function () {
  signOut(auth)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert("Logout gagal: " + error.message);
    });
};
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIaTx9x1_yz5N6t0uBp2eTc7tIBhMLRQA",
  authDomain: "buktiku-6e36b.firebaseapp.com",
  projectId: "buktiku-6e36b",
  storageBucket: "buktiku-6e36b.firebasestorage.app",
  messagingSenderId: "864927339878",
  appId: "1:864927339878:web:e11a53ac31e63c098c64a7",
  measurementId: "G-QBTSPKXLND"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.loginGoogle = async function () {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert(error.message);
  }
};
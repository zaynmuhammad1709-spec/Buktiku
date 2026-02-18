// =============================
// BUKTIKU ELITE - APP.JS
// =============================

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBIaTx9x1_yz5N6t0uBp2eTc7tIBhMLRQA",
  authDomain: "buktiku-6e36b.firebaseapp.com",
  projectId: "buktiku-6e36b",
  storageBucket: "buktiku-6e36b.appspot.com",
  messagingSenderId: "864927339878",
  appId: "1:864927339878:web:e11a53ac31e63c098c64a7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const storage = firebase.storage();


// =============================
// 🔐 LOGIN GOOGLE
// =============================
function loginGoogle() {
  auth.signInWithPopup(provider)
    .then((result) => {
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert("Login gagal: " + error.message);
    });
}


// =============================
// 👤 CEK USER LOGIN
// =============================
function checkUser() {
  auth.onAuthStateChanged(user => {
    if (user) {

      const nameEl = document.getElementById("name");
      const emailEl = document.getElementById("email");
      const photoEl = document.getElementById("photo");
      const loader = document.getElementById("loader");

      if(nameEl) nameEl.innerText = user.displayName;
      if(emailEl) emailEl.innerText = user.email;
      if(photoEl) photoEl.src = user.photoURL;

      if(loader) loader.style.display = "none";

    } else {
      if (window.location.pathname.includes("dashboard.html")) {
        window.location.href = "index.html";
      }
    }
  });
}


// =============================
// 📤 UPLOAD FILE
// =============================
function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const loader = document.getElementById("loader");

  if (!fileInput.files.length) {
    alert("Pilih file dulu!");
    return;
  }

  const file = fileInput.files[0];
  const user = auth.currentUser;

  if (!user) {
    alert("User belum login!");
    return;
  }

  loader.style.display = "flex";

  const storageRef = storage.ref("bukti/" + user.uid + "/" + file.name);

  storageRef.put(file)
    .then(() => storageRef.getDownloadURL())
    .then((url) => {
      addToList(url, file.name);
      loader.style.display = "none";
      fileInput.value = "";
    })
    .catch((error) => {
      loader.style.display = "none";
      alert("Upload gagal: " + error.message);
    });
}


// =============================
// 📋 TAMBAH KE LIST
// =============================
function addToList(url, name) {
  const list = document.getElementById("list");

  if (!list) return;

  const item = document.createElement("div");
  item.className = "transaction-item";

  item.innerHTML = `
    <p>${name}</p>
    <a href="${url}" target="_blank">Lihat</a>
  `;

  list.appendChild(item);
}


// =============================
// 🚪 LOGOUT
// =============================
function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
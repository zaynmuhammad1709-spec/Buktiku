// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBIaTx9x1_yz5N6t0uBp2eTc7tIBhMLRQA",
  authDomain: "buktiku-6e36b.firebaseapp.com",
  projectId: "buktiku-6e36b",
  storageBucket: "buktiku-6e36b.appspot.com",
  messagingSenderId: "864927339878",
  appId: "1:864927339878:web:e11a53ac31e63c098c64a7"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const storage = firebase.storage();
const db = firebase.firestore();

let transaksiData = [];
let alarmList = [];
let audioAllowed = false;

document.addEventListener('click', () => { audioAllowed = true; }, { once: true });
document.addEventListener('keydown', () => { audioAllowed = true; }, { once: true });

const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filter");

// LOGIN GOOGLE
function loginGoogle() {
  auth.signInWithPopup(provider)
    .then(() => { window.location.href = "dashboard.html"; })
    .catch(err => alert("Login gagal: " + err.message));
}

// CEK USER
auth.onAuthStateChanged(user => {
  if (user) {
    loadData(user.uid);
    loadAlarms(user.uid);
  } else if (window.location.pathname.includes("dashboard.html")) {
    window.location.href = "index.html";
  }
});

// TRANSAKSI - VERSI DIBENERIN
function tambahTransaksi() {
  const tanggal = document.getElementById("tanggal").value;
  const nominalStr = document.getElementById("nominal").value.trim();
  const keterangan = document.getElementById("keterangan").value.trim();
  const file = document.getElementById("fileInput").files[0];
  const user = auth.currentUser;

  if (!user) {
    alert("Anda harus login terlebih dahulu!");
    return;
  }

  if (!tanggal || !nominalStr || !keterangan || !file) {
    alert("Lengkapi semua field termasuk file bukti!");
    return;
  }

  const nominal = Number(nominalStr);
  if (isNaN(nominal) || nominal <= 0) {
    alert("Nominal harus angka positif!");
    return;
  }

  // Optional: validasi file type (image/pdf)
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    alert("File harus JPG, PNG, atau PDF!");
    return;
  }

  const storageRef = storage.ref(`bukti/\( {user.uid}/ \){Date.now()}_${file.name}`); // tambah timestamp biar unik

  // Proses upload + save
  storageRef.put(file)
    .then(snapshot => storageRef.getDownloadURL())
    .then(url => {
      return db.collection("transaksi").add({
        uid: user.uid,
        tanggal: tanggal,
        nominal: nominal,
        keterangan: keterangan,
        bukti: url,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert("Transaksi berhasil disimpan!");
      loadData(user.uid); // refresh list

      // Clear form
      document.getElementById("tanggal").value = "";
      document.getElementById("nominal").value = "";
      document.getElementById("keterangan").value = "";
      document.getElementById("fileInput").value = "";
    })
    .catch(err => {
      console.error("Error simpan transaksi:", err.code, err.message);
      let msg = "Gagal menyimpan: ";
      if (err.code === 'permission-denied') {
        msg += "Izin ditolak. Pastikan sudah login dan cek aturan keamanan Firebase.";
      } else if (err.code === 'storage/unauthorized') {
        msg += "Tidak diizinkan upload file. Cek rules Storage.";
      } else {
        msg += err.message;
      }
      alert(msg + "\nBuka F12 > Console untuk detail error.");
    });
}

function loadData(uid) {
  transaksiData = [];
  db.collection("transaksi")
    .where("uid", "==", uid)
    .orderBy("createdAt", "desc") // sort terbaru dulu (kalau createdAt ada)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => transaksiData.push(doc.data()));
      displayFilteredTransaksi();
    })
    .catch(err => console.error("Error load data:", err));
}

// Fungsi displayFilteredTransaksi() & exportPDF() tetap sama, tapi tambah try-catch kalau perlu
// ... (copy paste bagian itu dari kode asli kamu, tidak perlu ubah besar)

// ALARM - tambah error handling juga
function setAlarm() {
  // ... kode asli ...
  db.collection("alarms").add({ ... })
    .then(() => { alert("Alarm disimpan!"); loadAlarms(user.uid); })
    .catch(err => {
      console.error("Error simpan alarm:", err);
      alert("Gagal simpan alarm: " + err.message);
    });
}

// ... sisanya (loadAlarms, scheduleAlarm, logout) tetap sama
// ===== Firebase Config =====
const firebaseConfig = {
  apiKey: "API_KEY_KAMU",
  authDomain: "buktiku-6e36b.firebaseapp.com",
  projectId: "buktiku-6e36b",
  storageBucket: "buktiku-6e36b.appspot.com",
  messagingSenderId: "864927339878",
  appId: "1:864927339878:web:e11a53ac31e63c098c64a7"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ===== LOGIN GOOGLE =====
document.getElementById("googleLogin")?.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => window.location.href = "dashboard.html")
    .catch(err => alert(err.message));
});

// ===== LOGOUT =====
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  auth.signOut().then(()=>window.location.href="index.html");
});

// ===== LOAD DATA & TOTAL =====
function loadData(uid){
  const list = document.getElementById("transaksiList");
  const totalEl = document.getElementById("totalTransaksi");
  list.innerHTML = "";
  let total = 0;

  db.collection("transaksi")
    .where("uid","==",uid)
    .orderBy("tanggal","desc")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc=>{
        const data = doc.data();
        total += data.nominal;
        const div = document.createElement("div");
        div.classList.add("item");
        div.innerHTML = `
          <strong>${data.tanggal}</strong> - ${data.keterangan} - ${data.nominal}
          <br><img src="${data.bukti}" width="100">
        `;
        list.appendChild(div);
      });
      totalEl.textContent = total;
    });
}

// ===== TAMBAH TRANSAKSI (BASE64 FILE) =====
document.getElementById("saveTransaksi")?.addEventListener("click", ()=>{
  const user = auth.currentUser;
  if(!user){ alert("Login dulu!"); return; }

  const tanggal = document.getElementById("tanggal").value;
  const nominal = Number(document.getElementById("nominal").value);
  const keterangan = document.getElementById("keterangan").value;
  const file = document.getElementById("fileInput").files[0];

  if(!tanggal || !nominal || !keterangan || !file){ alert("Lengkapi semua data!"); return; }

  const reader = new FileReader();
  reader.onload = function(){
    const dataURL = reader.result;
    db.collection("transaksi").add({
      uid: user.uid,
      tanggal,
      nominal,
      keterangan,
      bukti: dataURL
    }).then(()=>{
      alert("Data tersimpan!");
      loadData(user.uid);
    }).catch(err=>alert("Gagal simpan: "+err.message));
  }
  reader.readAsDataURL(file);
});

// ===== SET ALARM =====
document.getElementById("setAlarmBtn")?.addEventListener("click", ()=>{
  const user = auth.currentUser;
  if(!user){ alert("Login dulu!"); return; }

  const time = document.getElementById("alarmTime").value;
  const note = document.getElementById("alarmNote").value;
  if(!time || !note){ alert("Isi waktu & catatan!"); return; }

  db.collection("alarms").add({
    uid: user.uid,
    time,
    note,
    triggered: false
  }).then(()=> alert("Alarm disimpan!"))
    .catch(err=>alert("Gagal simpan alarm: "+err.message));
});

// ===== ON AUTH STATE =====
auth.onAuthStateChanged(user=>{
  if(user){
    loadData(user.uid);
  } else if(window.location.pathname.includes("dashboard.html")){
    window.location.href = "index.html";
  }
});
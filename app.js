// =======================
// BUKTIKU PRO ELITE
// =======================

// Firebase Config
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
const db = firebase.firestore();

let transaksiData = [];
let alarmList = [];

// =======================
// LOGIN GOOGLE
// =======================
function loginGoogle() {
  auth.signInWithPopup(provider)
    .then(() => { window.location.href="dashboard.html"; })
    .catch((err)=> alert("Login gagal: "+err.message));
}

// =======================
// CEK USER & LOAD DATA
// =======================
auth.onAuthStateChanged(user => {
  if(user){
    loadData(user.uid);
    loadAlarms(user.uid);
  } else {
    if(window.location.pathname.includes("dashboard.html")){
      window.location.href="index.html";
    }
  }
});

// =======================
// TRANSAKSI
// =======================
function tambahTransaksi(){
  const tanggal = document.getElementById("tanggal").value;
  const nominal = document.getElementById("nominal").value;
  const keterangan = document.getElementById("keterangan").value;
  const file = document.getElementById("fileInput").files[0];
  const user = auth.currentUser;

  if(!tanggal || !nominal || !keterangan || !file){
    alert("Lengkapi semua data!");
    return;
  }

  const storageRef = storage.ref("bukti/"+user.uid+"/"+file.name);
  storageRef.put(file).then(()=>{
    storageRef.getDownloadURL().then(url=>{
      db.collection("transaksi").add({
        uid:user.uid, tanggal, nominal, keterangan, bukti:url
      }).then(()=>loadData(user.uid));
    });
  });
}

function loadData(uid){
  transaksiData=[];
  const list = document.getElementById("list");
  list.innerHTML="";

  db.collection("transaksi").where("uid","==",uid).get()
    .then(snapshot=>{
      snapshot.forEach(doc=>{
        const data=doc.data();
        transaksiData.push(data);
        const div=document.createElement("div");
        div.className="transaction-item";
        div.innerHTML=`<p>${data.tanggal} | Rp ${data.nominal}</p>
                       <p>${data.keterangan}</p>
                       <a href="${data.bukti}" target="_blank">Lihat Bukti</a>`;
        list.appendChild(div);
      });
    });
}

function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y=10;
  doc.text("Laporan Transaksi",10,y);
  y+=10;
  transaksiData.forEach(item=>{
    doc.text(`${item.tanggal} - Rp ${item.nominal}`,10,y);
    y+=8;
    doc.text(`${item.keterangan}`,10,y);
    y+=10;
  });
  doc.save("transaksi.pdf");
}

// =======================
// ALARM PERMANEN
// =======================
if(Notification.permission !== "granted") Notification.requestPermission();

function setAlarm(){
  const time = document.getElementById("alarmTime").value;
  const note = document.getElementById("alarmNote").value;
  const user = auth.currentUser;

  if(!time || !note){
    alert("Isi waktu & catatan!");
    return;
  }

  db.collection("alarms").add({
    uid:user.uid,
    time,
    note,
    triggered:false
  }).then(()=>{
    alert("Alarm disimpan!");
    loadAlarms(user.uid);
  });
}

function loadAlarms(uid){
  alarmList=[];
  const alarmBox=document.getElementById("alarmListBox");
  alarmBox.innerHTML="<h3>Daftar Alarm</h3>";

  db.collection("alarms").where("uid","==",uid).get()
    .then(snapshot=>{
      snapshot.forEach(doc=>{
        const data=doc.data();
        alarmList.push({id:doc.id,...data});

        const div=document.createElement("div");
        div.className="transaction-item";
        div.innerHTML=`<p>${data.time}</p><p>${data.note}</p>`;
        alarmBox.appendChild(div);

        scheduleAlarm(doc.id,data.time,data.note,data.triggered);
      });
    });
}

function scheduleAlarm(id,time,note,triggered){
  if(triggered) return;
  const alarmTime=new Date(time).getTime();
  const now=new Date().getTime();
  const delay=alarmTime-now;
  if(delay<=0) return;

  setTimeout(()=>{
    new Notification("🔔 Pengingat Pembayaran",{body:note});
    const audio=new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
    audio.play();
    db.collection("alarms").doc(id).update({triggered:true});
  },delay);
}

// =======================
// LOGOUT
// =======================
function logout(){
  auth.signOut().then(()=> window.location.href="index.html");
}
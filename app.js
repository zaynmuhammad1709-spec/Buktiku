// ====================== Firebase Config ======================
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
const db = firebase.firestore();

// ====================== Global ======================
let transaksiData = [];
let alarmList = [];
let audioAllowed = false;

// Untuk mengizinkan suara alarm setelah user klik halaman
document.addEventListener('click',()=>{audioAllowed=true;},{once:true});
document.addEventListener('keydown',()=>{audioAllowed=true;},{once:true});

// ====================== Login Google ======================
document.getElementById("googleLogin")?.addEventListener("click", ()=>{
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
      .then(()=> window.location.href="dashboard.html")
      .catch(err=>alert("Login gagal: "+err.message));
});

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", ()=>{
  auth.signOut().then(()=> window.location.href="index.html");
});

// ====================== Cek User ======================
auth.onAuthStateChanged(user=>{
  if(user){
    loadData(user.uid);
    loadAlarms(user.uid);
  } else if(window.location.pathname.includes("dashboard.html")){
    window.location.href="index.html";
  }
});

// ====================== Tambah Transaksi ======================
function tambahTransaksi(){
  const tanggal = document.getElementById("tanggal").value;
  const nominal = document.getElementById("nominal").value;
  const keterangan = document.getElementById("keterangan").value;
  const file = document.getElementById("fileInput").files[0];
  const user = auth.currentUser;

  if(!tanggal || !nominal || !keterangan || !file){alert("Lengkapi semua data!"); return;}

  showLoading();

  const reader = new FileReader();
  reader.onload = function(){
    const dataURL = reader.result; // Base64
    db.collection("transaksi").add({
      uid: user.uid,
      tanggal,
      nominal: Number(nominal),
      keterangan,
      bukti: dataURL
    })
    .then(()=>{ hideLoading(); alert("Transaksi tersimpan!"); loadData(user.uid); })
    .catch(err=>{ hideLoading(); alert("Gagal simpan: "+err.message); });
  }
  reader.readAsDataURL(file);
}

// ====================== Load & Display Transaksi ======================
function loadData(uid){
  transaksiData=[];
  db.collection("transaksi").where("uid","==",uid).get()
    .then(snapshot=>{
      snapshot.forEach(doc=>transaksiData.push(doc.data()));
      displayFilteredTransaksi();
    });
}

const searchInput=document.getElementById("searchInput");
const filterSelect=document.getElementById("filter");
searchInput?.addEventListener("input", displayFilteredTransaksi);
filterSelect?.addEventListener("change", displayFilteredTransaksi);

function displayFilteredTransaksi(){
  const list=document.getElementById("list");
  if(!list) return;
  list.innerHTML="";
  const now=new Date();
  const searchTerm=searchInput?.value.toLowerCase()||"";
  const filterVal=filterSelect?.value||"";
  let total=0;

  let filtered=transaksiData.filter(item=>{
    const tgl=new Date(item.tanggal);
    if(filterVal=="weekly" && (now-tgl)/(1000*60*60*24)>7) return false;
    if(filterVal=="monthly" && !(tgl.getMonth()==now.getMonth() && tgl.getFullYear()==now.getFullYear())) return false;

    if(searchTerm!==""){
      if(!item.keterangan.toLowerCase().includes(searchTerm) &&
         !item.tanggal.toLowerCase().includes(searchTerm) &&
         !item.nominal.toString().includes(searchTerm)){
        return false;
      }
    }
    total+=Number(item.nominal);
    return true;
  });

  document.getElementById("totalValue")?.innerText=`Rp ${total.toLocaleString()}`;

  filtered.forEach(data=>{
    const div=document.createElement("div");
    div.className="transaction-item";
    div.innerHTML=`
      <p>${data.tanggal} | Rp ${data.nominal.toLocaleString()}</p>
      <p>${data.keterangan}</p>
      <img src="${data.bukti}" width="120" />
    `;
    list.appendChild(div);
  });
}

// ====================== Export PDF ======================
function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc=new jsPDF();
  let y=10;
  doc.text("Laporan Transaksi",10,y);
  y+=10;

  const now=new Date();
  const searchTerm=searchInput?.value.toLowerCase()||"";
  const filterVal=filterSelect?.value||"";
  let totalPDF=0;

  let filtered=transaksiData.filter(item=>{
    const tgl=new Date(item.tanggal);
    if(filterVal=="weekly" && (now-tgl)/(1000*60*60*24)>7) return false;
    if(filterVal=="monthly" && !(tgl.getMonth()==now.getMonth() && tgl.getFullYear()==now.getFullYear())) return false;

    if(searchTerm!==""){
      if(!item.keterangan.toLowerCase().includes(searchTerm) &&
         !item.tanggal.toLowerCase().includes(searchTerm) &&
         !item.nominal.toString().includes(searchTerm)){
        return false;
      }
    }
    totalPDF+=Number(item.nominal);
    return true;
  });

  filtered.forEach(item=>{
    doc.text(`${item.tanggal} - Rp ${item.nominal.toLocaleString()}`,10,y); y+=8;
    doc.text(`${item.keterangan}`,10,y); y+=10;
  });
  doc.text(`Total Nilai Transaksi: Rp ${totalPDF.toLocaleString()}`,10,y+5);
  doc.save("riwayat_transaksi.pdf");
}

// ====================== Alarm ======================
if(Notification.permission!=="granted") Notification.requestPermission();

function setAlarm(){
  const time=document.getElementById("alarmTime").value;
  const note=document.getElementById("alarmNote").value;
  const user=auth.currentUser;

  if(!time || !note){ alert("Isi waktu & catatan!"); return; }

  db.collection("alarms").add({uid:user.uid,time,note,triggered:false})
    .then(()=>{ alert("Alarm disimpan!"); loadAlarms(user.uid); })
    .catch(err=>alert("Gagal simpan alarm: "+err.message));
}

function loadAlarms(uid){
  alarmList=[];
  const alarmBox=document.getElementById("alarmListBox");
  if(!alarmBox) return;
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
    if(audioAllowed){
      const audio=new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
      audio.play().catch(err=>alert("⚠ Browser memblokir audio alarm"));
    } else alert("⚠ Klik halaman untuk mengizinkan suara alarm");
    db.collection("alarms").doc(id).update({triggered:true});
  },delay);
}

// ====================== Loading Overlay ======================
function showLoading(){ document.getElementById("loading")?.style.display="flex"; }
function hideLoading(){ document.getElementById("loading")?.style.display="none"; }
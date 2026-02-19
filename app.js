import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = "https://xrvvwyrvjwloxxvcurev.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydnZ3eXJ2andsb3h4dmN1cmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NzEwMTksImV4cCI6MjA4NzA0NzAxOX0.ZgC-oi8RaqKK4tkzPpECO_fOUUMUqFpl0p6oxkXMJK8"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

document.addEventListener("DOMContentLoaded", async () => {

  const loginBtn = document.getElementById("loginBtn")
  const logoutBtn = document.getElementById("logoutBtn")

  // LOGIN GOOGLE
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      await supabase.auth.signInWithOAuth({
        provider: "google",
      })
    })
  }

  // LOGOUT
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut()
      window.location.href = "index.html"
    })
  }

  // CEK SESSION
  const { data: { session } } = await supabase.auth.getSession()

  if (session && window.location.pathname.includes("index")) {
    window.location.href = "dashboard.html"
  }

  if (!session && window.location.pathname.includes("dashboard")) {
    window.location.href = "index.html"
  }

})

// TRANSAKSI
function tambahTransaksi(){
  const tanggal=document.getElementById("tanggal").value;
  const nominal=document.getElementById("nominal").value;
  const keterangan=document.getElementById("keterangan").value;
  const file=document.getElementById("fileInput").files[0];
  const user=auth.currentUser;

  if(!tanggal||!nominal||!keterangan||!file){alert("Lengkapi semua data!"); return;}

  const storageRef=storage.ref("bukti/"+user.uid+"/"+file.name);
  storageRef.put(file).then(()=>{
    storageRef.getDownloadURL().then(url=>{
      db.collection("transaksi").add({uid:user.uid,tanggal,nominal,keterangan,bukti:url})
      .then(()=>loadData(user.uid));
    });
  });
}

function loadData(uid){
  transaksiData=[];
  db.collection("transaksi").where("uid","==",uid).get()
    .then(snapshot=>{snapshot.forEach(doc=>transaksiData.push(doc.data())); displayFilteredTransaksi();});
}

function displayFilteredTransaksi(){
  const list=document.getElementById("list");
  list.innerHTML="";
  const now=new Date();
  const searchTerm=searchInput.value.toLowerCase();
  const filterVal=filterSelect.value;
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

    total += Number(item.nominal);
    return true;
  });

  document.getElementById("totalValue").innerText=`Rp ${total.toLocaleString()}`;

  filtered.forEach(data=>{
    const div=document.createElement("div");
    div.className="transaction-item";
    div.innerHTML=`<p>${data.tanggal} | Rp ${data.nominal.toLocaleString()}</p>
                   <p>${data.keterangan}</p>
                   <a href="${data.bukti}" target="_blank">Lihat Bukti</a>`;
    list.appendChild(div);
  });
}

// EXPORT PDF
function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc=new jsPDF();
  let y=10;
  doc.text("Laporan Transaksi",10,y);
  y+=10;

  const now=new Date();
  const searchTerm=searchInput.value.toLowerCase();
  const filterVal=filterSelect.value;
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

// ALARM
if(Notification.permission!=="granted") Notification.requestPermission();

function setAlarm(){
  const time=document.getElementById("alarmTime").value;
  const note=document.getElementById("alarmNote").value;
  const user=auth.currentUser;

  if(!time||!note){alert("Isi waktu & catatan!"); return;}

  db.collection("alarms").add({uid:user.uid,time,note,triggered:false})
    .then(()=>{alert("Alarm disimpan!"); loadAlarms(user.uid);})
    .catch(err=>alert("Gagal simpan alarm: "+err.message));
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
    if(audioAllowed){
      const audio=new Audio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3");
      audio.play().catch(err=>alert("⚠ Browser memblokir audio alarm"));
    } else alert("⚠ Klik halaman untuk mengizinkan suara alarm");
    db.collection("alarms").doc(id).update({triggered:true});
  },delay);
}

// LOGOUT
function logout(){auth.signOut().then(()=> window.location.href="index.html");}
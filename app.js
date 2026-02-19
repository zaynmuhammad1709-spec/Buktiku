const SUPABASE_URL = "https://xrvvwyrvjwloxxvcurev.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydnZ3eXJ2andsb3h4dmN1cmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NzEwMTksImV4cCI6MjA4NzA0NzAxOX0.ZgC-oi8RaqKK4tkzPpECO_fOUUMUqFpl0p6oxkXMJK8";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {

  const { data } = await supabase.auth.getSession();

  if(window.location.pathname.includes("dashboard")){
    if(!data.session){
      window.location.href="index.html";
      return;
    }
    loadData(data.session.user.id);
    loadAlarms(data.session.user.id);
  }

  if(window.location.pathname.includes("index") && data.session){
    window.location.href="dashboard.html";
  }

  // LOGIN
  const loginBtn=document.getElementById("loginBtn");
  if(loginBtn){
    loginBtn.onclick=async()=>{
      const email=document.getElementById("email").value;
      const password=document.getElementById("password").value;

      const {error}=await supabase.auth.signInWithPassword({email,password});
      if(error) alert(error.message);
      else window.location.href="dashboard.html";
    }
  }

  // REGISTER
  const registerBtn=document.getElementById("registerBtn");
  if(registerBtn){
    registerBtn.onclick=async()=>{
      const email=document.getElementById("email").value;
      const password=document.getElementById("password").value;

      const {error}=await supabase.auth.signUp({email,password});
      if(error) alert(error.message);
      else alert("Cek email untuk verifikasi!");
    }
  }

  // LOGOUT
  const logoutBtn=document.getElementById("logoutBtn");
  if(logoutBtn){
    logoutBtn.onclick=async()=>{
      await supabase.auth.signOut();
      window.location.href="index.html";
    }
  }

  // SIMPAN TRANSAKSI
  const saveBtn=document.getElementById("saveBtn");
  if(saveBtn){
    saveBtn.onclick=async()=>{
      const { data:{session} } = await supabase.auth.getSession();
      const user=session.user;

      const tanggal=document.getElementById("tanggal").value;
      const nominal=document.getElementById("nominal").value;
      const keterangan=document.getElementById("keterangan").value;
      const file=document.getElementById("fileInput").files[0];

      let bukti_url=null;

      if(file){
        const filePath=`${user.id}/${Date.now()}-${file.name}`;
        await supabase.storage.from("bukti").upload(filePath,file);
        const { data } = supabase.storage.from("bukti").getPublicUrl(filePath);
        bukti_url=data.publicUrl;
      }

      await supabase.from("transaksi").insert([
        {uid:user.id,tanggal,nominal:Number(nominal),keterangan,bukti_url}
      ]);

      loadData(user.id);
    }
  }

  // FILTER
  const filter=document.getElementById("filter");
  const search=document.getElementById("searchInput");
  if(filter) filter.onchange=()=>loadData(data.session.user.id);
  if(search) search.oninput=()=>loadData(data.session.user.id);

  // ALARM
  const setAlarmBtn=document.getElementById("setAlarmBtn");
  if(setAlarmBtn){
    setAlarmBtn.onclick=async()=>{
      const waktu=document.getElementById("alarmTime").value;
      const catatan=document.getElementById("alarmNote").value;

      await supabase.from("alarms").insert([
        {uid:data.session.user.id,waktu,catatan,triggered:false}
      ]);
      loadAlarms(data.session.user.id);
    }
  }

});

async function loadData(uid){
  const { data }=await supabase.from("transaksi").select("*").eq("uid",uid);

  const list=document.getElementById("list");
  const filter=document.getElementById("filter").value;
  const search=document.getElementById("searchInput").value.toLowerCase();
  const now=new Date();

  list.innerHTML="";
  let total=0;

  data.forEach(item=>{
    const tgl=new Date(item.tanggal);
    if(filter==="weekly" && (now-tgl)/(1000*60*60*24)>7) return;
    if(filter==="monthly" && (tgl.getMonth()!=now.getMonth())) return;

    if(search && !item.keterangan.toLowerCase().includes(search)) return;

    total+=item.nominal;

    const div=document.createElement("div");
    div.className="glass-card";
    div.innerHTML=`
      <p>${item.tanggal} - Rp ${item.nominal}</p>
      <p>${item.keterangan}</p>
      ${item.bukti_url?`<a href="${item.bukti_url}" target="_blank">Lihat Bukti</a>`:""}
    `;
    list.appendChild(div);
  });

  document.getElementById("totalValue").innerText="Rp "+total.toLocaleString();
}

async function loadAlarms(uid){
  const { data }=await supabase.from("alarms").select("*").eq("uid",uid);

  const box=document.getElementById("alarmList");
  box.innerHTML="";

  data.forEach(alarm=>{
    const div=document.createElement("div");
    div.className="glass-card";
    div.innerHTML=`<p>${alarm.waktu}</p><p>${alarm.catatan}</p>`;
    box.appendChild(div);
  });
}
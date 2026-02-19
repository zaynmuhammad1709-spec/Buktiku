const supabaseUrl = "https://xrvvwyrvjwloxxvcurev.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydnZ3eXJ2andsb3h4dmN1cmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NzEwMTksImV4cCI6MjA4NzA0NzAxOX0.ZgC-oi8RaqKK4tkzPpECO_fOUUMUqFpl0p6oxkXMJK8";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function tambahTransaksi() {
  const tanggal = document.getElementById("tanggal").value;
  const nominal = document.getElementById("nominal").value;
  const keterangan = document.getElementById("keterangan").value;
  const bukti_url = document.getElementById("bukti_url").value;

  await supabase.from("transaksi").insert([
    { tanggal, nominal, keterangan, bukti_url }
  ]);

  loadData();
}

async function loadData() {
  const { data } = await supabase
    .from("transaksi")
    .select("*")
    .order("tanggal", { ascending: false });

  tampilkanData(data);
}

function tampilkanData(data) {
  const tbody = document.getElementById("riwayat");
  tbody.innerHTML = "";
  let total = 0;

  data.forEach(item => {
    total += Number(item.nominal);

    tbody.innerHTML += `
      <tr>
        <td>${item.tanggal}</td>
        <td>Rp ${item.nominal}</td>
        <td>${item.keterangan}</td>
      </tr>
    `;
  });

  document.getElementById("totalNominal").innerText = 
    "Rp " + total.toLocaleString();
}

async function filterMingguan() {
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

  const { data } = await supabase
    .from("transaksi")
    .select("*")
    .gte("tanggal", lastWeek.toISOString().split("T")[0]);

  tampilkanData(data);
}

async function filterBulanan() {
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);

  const { data } = await supabase
    .from("transaksi")
    .select("*")
    .gte("tanggal", lastMonth.toISOString().split("T")[0]);

  tampilkanData(data);
}

loadData();
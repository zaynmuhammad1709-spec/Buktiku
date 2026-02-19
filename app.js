const supabase = window.supabase.createClient(
'https://xrvvwyrvjwloxxvcurev.supabase.co',
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydnZ3eXJ2andsb3h4dmN1cmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NzEwMTksImV4cCI6MjA4NzA0NzAxOX0.ZgC-oi8RaqKK4tkzPpECO_fOUUMUqFpl0p6oxkXMJK8'
);

const filterSelect = document.getElementById("filterSelect");
const searchDate = document.getElementById("searchDate");

async function loadData(){
    const { data } = await supabase
    .from('transaksi')
    .select('*')
    .order('created_at',{ascending:false});

    let total=0;
    let html='';

    const now = new Date();
    const filter = filterSelect.value;
    const searchVal = searchDate.value;

    const filteredData = data.filter(item=>{
        const tgl = new Date(item.tanggal);
        if(filter === "today" && (tgl.toDateString() !== now.toDateString())) return false;
        if(filter === "monthly" && !(tgl.getMonth() === now.getMonth() && tgl.getFullYear() === now.getFullYear())) return false;
        if(filter === "yearly" && tgl.getFullYear() !== now.getFullYear()) return false;
        if(searchVal && tgl.toISOString().split("T")[0] !== searchVal) return false;
        return true;
    });

    filteredData.forEach(item=>{
        total+=item.nominal;
        html+=`
        <tr>
            <td>${item.tanggal}</td>
            <td>Rp ${item.nominal.toLocaleString()}</td>
            <td><img src="${item.bukti_url}" class="preview"></td>
        </tr>`;
    });

    document.getElementById('data').innerHTML=html;
    document.getElementById('total').innerText='Rp '+total.toLocaleString();
}

filterSelect.addEventListener("change", loadData);
searchDate.addEventListener("change", loadData);

async function simpan(){
    const tanggal=document.getElementById('tanggal').value;
    const nominal=parseInt(document.getElementById('nominal').value);
    const keterangan=document.getElementById('keterangan').value;
    const file=document.getElementById('bukti').files[0];

    if(!tanggal||!nominal||!file){
        alert("Lengkapi data + upload gambar");
        return;
    }

    const fileName=Date.now()+"-"+file.name;

    const { error:uploadError } = await supabase
    .storage.from('bukti')
    .upload(fileName,file);

    if(uploadError){alert(uploadError.message); return;}

    const { data:urlData } = supabase
    .storage.from('bukti')
    .getPublicUrl(fileName);

    const bukti_url=urlData.publicUrl;

    const { error } = await supabase
    .from('transaksi')
    .insert([{tanggal,nominal,keterangan,bukti_url}]);

    if(error){alert(error.message); return;}

    document.getElementById('tanggal').value='';
    document.getElementById('nominal').value='';
    document.getElementById('keterangan').value='';
    document.getElementById('bukti').value='';

    loadData();
}

loadData();

// JAM DIGITAL
function updateJam(){
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    document.getElementById('jam').innerText = `${h}:${m}:${s}`;
}
setInterval(updateJam,1000);
updateJam();

// EXPORT PDF
function exportPDF(){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16);
    doc.text("Laporan Transaksi", 10, y); y+=10;

    const rows = document.querySelectorAll("#data tr");
    let totalPDF = 0;

    rows.forEach(row=>{
        const cols = row.querySelectorAll("td");
        const tanggal = cols[0].innerText;
        const nominal = cols[1].innerText;
        const keterangan = cols[2].querySelector("img") ? "Bukti Terlampir" : "";
        doc.setFontSize(12);
        doc.text(`${tanggal} - ${nominal} - ${keterangan}`, 10, y); y+=8;
        totalPDF += parseInt(nominal.replace(/[^0-9]/g,''));
    });

    doc.setFontSize(14);
    doc.text(`Total: Rp ${totalPDF.toLocaleString()}`, 10, y+5);
    doc.save("riwayat_transaksi.pdf");
}
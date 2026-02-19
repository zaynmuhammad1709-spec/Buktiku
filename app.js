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
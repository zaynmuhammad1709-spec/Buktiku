Buktiku Elite Pro - README

Versi: Final All-In-One
Fitur:
1. Login Google (Firebase Authentication)
2. Dashboard Elite Pro responsive
3. Tambah transaksi + upload bukti (Base64)
4. Riwayat transaksi + filter mingguan/bulanan + total nilai
5. Export PDF laporan transaksi
6. Alarm / pengingat permanen + auto load + suara
7. Loading overlay modern

Panduan Deploy ke GitHub Pages:

1. Buat repository baru di GitHub (contoh: Buktiku-Elite-Pro)
2. Upload semua file berikut ke repo:
   - index.html
   - dashboard.html
   - style.css
   - app.js
   - logo.png
   - README.txt
3. Pergi ke Settings → Pages:
   - Branch: main
   - Folder: / (root)
   - Save
4. Tunggu beberapa menit, lalu akses URL GitHub Pages:
   https://USERNAME.github.io/Buktiku-Elite-Pro/

Firebase Setup:

1. Masuk ke Firebase Console (https://console.firebase.google.com/)
2. Buat Project: "Buktiku"
3. Aktifkan Authentication → Google Sign-In → Authorized Domains:
   - github.io
   - USERNAME.github.io
4. Buat Firestore Database:
   - Mode: Test
   - Location: pilih default
5. Tidak perlu Storage, karena bukti transaksi disimpan sebagai Base64 di Firestore

Cara Pakai:

1. Buka halaman login (index.html)
2. Klik "Login dengan Google"
3. Dashboard akan tampil
4. Tambah transaksi:
   - Pilih tanggal, nominal, keterangan
   - Upload bukti (foto/pdf)
   - Klik "Simpan Transaksi"
5. Lihat riwayat, filter mingguan/bulanan
6. Export PDF untuk laporan
7. Set Alarm / Pengingat:
   - Pilih waktu + catatan
   - Alarm akan tampil dan berbunyi otomatis

Catatan:

- Pastikan semua file JS & HTML sudah diupload ke GitHub Pages
- Gunakan browser yang mendukung Notifications untuk alarm
- Base64 digunakan supaya tidak perlu Firebase Storage berbayar
- Untuk fitur export PDF, gunakan browser modern

Kontak / Bantuan:

- Fitrah Grab
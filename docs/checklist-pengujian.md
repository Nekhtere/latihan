# Checklist Pengujian

Uji di link Vercel, bukan hanya di laptop. Coba juga di HP.

## Pengunjung

- [ ] Katalog menampilkan semua produk dari database (bukan data contoh).
- [ ] Harga tampil dalam format rupiah, misalnya Rp 45.000.
- [ ] Klik kartu produk membuka halaman detail produk yang benar.
- [ ] Alamat produk yang tidak ada (misalnya `/produk/9999`) menampilkan halaman "tidak ditemukan".
- [ ] Tombol "Pesan via WhatsApp" membuka WhatsApp ke nomor toko dengan pesan berisi nama dan harga produk.
- [ ] Tampilan rapi di HP: teks terbaca, tombol mudah ditekan, tidak ada yang terpotong.

## Admin

- [ ] Login dengan email dan password yang benar berhasil masuk ke `/admin`.
- [ ] Login dengan password salah menampilkan pesan error.
- [ ] Ganti password berhasil, lalu login dengan password baru berhasil.
- [ ] Password baru kurang dari 8 karakter atau tidak sama dengan konfirmasi ditolak dengan pesan yang jelas.
- [ ] Tombol "Keluar" mengakhiri sesi.
- [ ] Daftar produk di `/admin` menampilkan produk yang sama dengan katalog (bukan data contoh).
- [ ] Jumlah produk di `/admin` sama dengan jumlah kartu di katalog.
- [ ] Produk yang baru ditambah di Supabase > Table Editor langsung muncul di `/admin` setelah muat ulang.

## Bonus (jika dikerjakan)

- [ ] Tambah produk: produk baru muncul di katalog.
- [ ] Ubah produk: perubahan muncul di katalog.
- [ ] Hapus produk: produk hilang dari katalog setelah konfirmasi.

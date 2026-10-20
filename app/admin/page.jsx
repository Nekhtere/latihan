import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatKlienSesi } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

// US-07 (bonus): daftar produk diambil dari tabel "produk" di Supabase.
// Memakai koneksi sesi admin, jadi hanya admin yang login yang bisa membaca
// data dan aturan Row Level Security tetap berlaku.
async function ambilDaftarProduk() {
  const supabase = await buatKlienSesi();

  const {
    data: { user },
    error: errorSesi,
  } = await supabase.auth.getUser();

  if (errorSesi || !user) {
    throw new Error("Sesi admin tidak ditemukan.");
  }

  const { data, error } = await supabase
    .from("produk")
    .select("id, nama, harga, kategori, foto_url")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil daftar produk: ${error.message}`);
  }

  return data ?? [];
}

export default async function HalamanAdmin() {
  let daftarProduk = [];
  let pesanError = "";

  try {
    daftarProduk = await ambilDaftarProduk();
  } catch (error) {
    console.error("Admin: gagal mengambil daftar produk dari Supabase.", error);
    pesanError = "Daftar produk gagal dimuat. Coba muat ulang halaman ini.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Produk</h1>
          {!pesanError ? (
            <p className="mt-1 text-sm text-teks-lembut">
              {daftarProduk.length} produk di database
            </p>
          ) : null}
        </div>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>
      {pesanError ? (
        <p
          role="alert"
          className="rounded-lg border border-bahaya/40 bg-latar px-3 py-2 text-sm text-bahaya"
        >
          {pesanError}
        </p>
      ) : daftarProduk.length === 0 ? (
        <p className="text-teks-lembut">
          Belum ada produk di database. Tambah produk dulu lewat tombol "Tambah produk".
        </p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}

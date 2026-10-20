import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import FormUbahProduk from "@/components/FormUbahProduk";
import { buatKlienSesi } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

// US-09 (bonus di jalur offline): ubah produk.
// Data lama diambil dari tabel "produk" di sisi server memakai koneksi sesi
// admin, jadi hanya admin yang login yang bisa membacanya (RLS tetap berlaku).
async function ambilProduk(id) {
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
    .select("id, nama, harga, deskripsi, foto_url, kategori")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal mengambil produk: ${error.message}`);
  }

  return data;
}

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  let produk = null;
  let pesanError = "";

  try {
    produk = await ambilProduk(id);
  } catch (error) {
    console.error("Admin: gagal mengambil produk dari Supabase.", error);
    pesanError = "Produk gagal dimuat. Coba muat ulang halaman ini.";
  }

  if (!pesanError && !produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      {pesanError ? (
        <div className="flex flex-col items-start gap-4">
          <p
            role="alert"
            className="rounded-lg border border-bahaya/40 bg-latar px-3 py-2 text-sm text-bahaya"
          >
            {pesanError}
          </p>
          <Tombol href="/admin" varian="garis">
            Kembali ke daftar produk
          </Tombol>
        </div>
      ) : (
        <FormUbahProduk produk={produk} />
      )}
    </div>
  );
}

import KartuProduk from "@/components/KartuProduk";
import { buatKlienServer } from "@/lib/supabase/server";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";

async function ambilProduk() {
  const supabase = buatKlienServer();

  const { data, error } = await supabase
    .from("produk")
    .select("id, nama, harga, deskripsi, foto_url, kategori")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil produk: ${error.message}`);
  }

  return data ?? [];
}

export default async function HalamanKatalog() {
  let daftarProduk = [];
  let pesanError = "";

  try {
    daftarProduk = await ambilProduk();
  } catch (error) {
    console.error("Katalog: gagal mengambil produk dari Supabase.", error);
    pesanError = "Produk gagal dimuat. Coba muat ulang halaman ini.";
  }

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>
        {pesanError ? (
          <p
            role="alert"
            className="rounded-lg border border-bahaya/40 bg-latar px-3 py-2 text-sm text-bahaya"
          >
            {pesanError}
          </p>
        ) : daftarProduk.length === 0 ? (
          <p className="text-teks-lembut">Belum ada produk</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

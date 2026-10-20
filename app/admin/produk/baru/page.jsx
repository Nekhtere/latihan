import NavAdmin from "@/components/NavAdmin";
import FormTambahProduk from "@/components/FormTambahProduk";

// US-08 (bonus di jalur offline): tambah produk.
// Form disimpan ke database lewat Server Action; setelah itu halaman kembali
// ke /admin.
export default function HalamanTambahProduk() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      <FormTambahProduk />
    </div>
  );
}

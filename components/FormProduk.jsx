import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// Nama field sama dengan kolom tabel "produk".
// `action` diisi Server Action supaya form bisa disimpan ke database.
export default function FormProduk({
  produk = {},
  labelTombol,
  action,
  state,
  pending = false,
}) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <Input label="Nama produk" name="nama" defaultValue={produk.nama} required />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        step="1"
        defaultValue={produk.harga}
        required
      />
      <Input label="Kategori" name="kategori" defaultValue={produk.kategori} />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />
      <Input label="Deskripsi" name="deskripsi" textarea defaultValue={produk.deskripsi} />
      {state?.error ? (
        <p
          role="alert"
          className="rounded-lg border border-bahaya/40 bg-latar px-3 py-2 text-sm text-bahaya"
        >
          {state.error}
        </p>
      ) : null}
      {state?.sukses ? (
        <p
          role="status"
          className="rounded-lg border border-utama/40 bg-latar px-3 py-2 text-sm text-utama"
        >
          {state.sukses}
        </p>
      ) : null}
      <div className="flex gap-3">
        <Tombol type="submit" disabled={pending}>
          {labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}

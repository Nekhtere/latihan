"use client";

import { useTransition, useState } from "react";
import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

// US-10 (bonus): tombol hapus produk. Minta konfirmasi dulu di browser,
// lalu prosesnya di Server Action: login diperiksa di server dan baris
// dihapus dari database lewat koneksi sesi admin (RLS tetap berlaku).
export default function TombolHapusProduk({ id, nama }) {
  const [pending, startTransition] = useTransition();
  const [pesanError, setPesanError] = useState("");

  function konfirmasiLaluHapus() {
    const yakin = window.confirm(
      `Hapus produk "${nama}"? Produk tidak bisa dikembalikan.`
    );

    if (!yakin) {
      return;
    }

    setPesanError("");

    startTransition(async () => {
      const hasil = await hapusProduk(id);

      if (hasil?.error) {
        setPesanError(hasil.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Tombol
        type="button"
        varian="bahaya"
        onClick={konfirmasiLaluHapus}
        disabled={pending}
      >
        {pending ? "Menghapus..." : "Hapus"}
      </Tombol>
      {pesanError ? (
        <p
          role="alert"
          className="max-w-[14rem] rounded-lg border border-bahaya/40 bg-latar px-2 py-1 text-right text-xs text-bahaya"
        >
          {pesanError}
        </p>
      ) : null}
    </div>
  );
}
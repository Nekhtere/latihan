"use client";

import { useActionState } from "react";
import FormProduk from "@/components/FormProduk";
import { ubahProduk } from "@/app/admin/actions";

const keadaanAwal = { error: "", sukses: "" };

// US-09 (bonus): form ubah produk. Pengiriman form dan pemeriksaan login
// dilakukan di server lewat Server Action; komponen ini hanya menampilkan
// hasilnya. Data lama sudah terisi dari database lewat prop `produk`.
export default function FormUbahProduk({ produk }) {
  const [state, formAction, pending] = useActionState(ubahProduk, keadaanAwal);

  return (
    <FormProduk
      produk={produk}
      labelTombol="Simpan perubahan"
      action={formAction}
      state={state}
      pending={pending}
    />
  );
}
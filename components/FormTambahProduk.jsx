"use client";

import { useActionState } from "react";
import FormProduk from "@/components/FormProduk";
import { simpanProduk } from "@/app/admin/actions";

const keadaanAwal = { error: "", sukses: "" };

// US-08 (bonus): form tambah produk. Pengiriman form dan pembuatan Server
// Action dilakukan di server; komponen ini hanya menampilkan hasilnya.
export default function FormTambahProduk() {
  const [state, formAction, pending] = useActionState(simpanProduk, keadaanAwal);

  return (
    <FormProduk
      labelTombol="Simpan produk"
      action={formAction}
      state={state}
      pending={pending}
    />
  );
}
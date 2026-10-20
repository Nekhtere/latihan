"use server";

import { redirect } from "next/navigation";
import { buatKlienSesi } from "@/lib/supabase/session";

export async function masukAdmin(_keadaanSebelumnya, formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  try {
    const supabase = await buatKlienSesi();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Login admin gagal:", error.message);

      if (
        error.code === "invalid_credentials" ||
        /invalid login credentials/i.test(error.message)
      ) {
        return { error: "Email atau password salah. Periksa kembali lalu coba lagi." };
      }

      return { error: "Login gagal diproses. Coba lagi beberapa saat lagi." };
    }
  } catch (error) {
    console.error("Login admin gagal:", error);
    return { error: "Login gagal diproses. Coba lagi beberapa saat lagi." };
  }

  redirect("/admin");
}

export async function keluarAdmin() {
  try {
    const supabase = await buatKlienSesi();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Keluar admin gagal:", error.message);
    }
  } catch (error) {
    console.error("Keluar admin gagal:", error);
  }

  redirect("/admin/login");
}

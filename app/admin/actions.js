"use server";

import { redirect } from "next/navigation";
import { buatKlienSesi } from "@/lib/supabase/session";

// Ambil sesi admin dari cookie. Dipakai aksi yang mengubah data supaya login
// selalu diperiksa di server (lihat AGENTS.md, aturan keamanan 3).
async function ambilAdmin() {
  const supabase = await buatKlienSesi();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { supabase, user, error };
}

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

// Aksi yang mengubah data: periksa sesi admin di server sebelum menulis.
export async function gantiPassword(_keadaanSebelumnya, formData) {
  const passwordBaru = String(formData.get("password_baru") ?? "");
  const konfirmasi = String(formData.get("konfirmasi_password") ?? "");

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter.", sukses: "" };
  }

  if (passwordBaru !== konfirmasi) {
    return {
      error: "Konfirmasi password tidak sama dengan password baru.",
      sukses: "",
    };
  }

  try {
    const { supabase, user, error: errorSesi } = await ambilAdmin();

    if (errorSesi || !user) {
      console.error("Ganti password gagal: sesi admin tidak ditemukan.", errorSesi);
      return {
        error: "Sesi admin tidak ditemukan. Silakan masuk lagi.",
        sukses: "",
      };
    }

    const { error } = await supabase.auth.updateUser({ password: passwordBaru });

    if (error) {
      console.error("Ganti password gagal:", error.code, error.message);

      if (error.code === "same_password") {
        return {
          error: "Password baru harus berbeda dari password lama.",
          sukses: "",
        };
      }

      if (error.code === "weak_password") {
        return {
          error: "Password terlalu lemah. Gunakan password yang lebih kuat.",
          sukses: "",
        };
      }

      if (
        error.code === "session_not_found" ||
        error.code === "session_expired" ||
        /session|not authenticated/i.test(error.message)
      ) {
        return {
          error: "Sesi admin sudah berakhir. Silakan masuk lagi.",
          sukses: "",
        };
      }

      return {
        error: "Password gagal diganti. Coba lagi beberapa saat lagi.",
        sukses: "",
      };
    }

    return { error: "", sukses: "Password berhasil diganti." };
  } catch (error) {
    console.error("Ganti password gagal:", error);

    if (/session|not authenticated/i.test(error?.message ?? "")) {
      return {
        error: "Sesi admin tidak ditemukan. Silakan masuk lagi.",
        sukses: "",
      };
    }

    return {
      error: "Password gagal diganti. Coba lagi beberapa saat lagi.",
      sukses: "",
    };
  }
}

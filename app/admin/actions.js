"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

// US-08 (bonus): tambah produk baru dari halaman admin.
// Semua pemeriksaan dilakukan di server; memakai koneksi sesi admin sehingga
// aturan Row Level Security (admin_tambah_produk) tetap berlaku.
export async function simpanProduk(_keadaanSebelumnya, formData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const hargaMentah = String(formData.get("harga") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "").trim();
  const fotoUrl = String(formData.get("foto_url") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "").trim();

  if (!nama) {
    return { error: "Nama produk wajib diisi.", sukses: "" };
  }

  if (!hargaMentah) {
    return { error: "Harga wajib diisi.", sukses: "" };
  }

  const harga = Number(hargaMentah);

  if (!Number.isInteger(harga) || harga < 0) {
    return {
      error: "Harga harus berupa angka bulat dan tidak boleh negatif.",
      sukses: "",
    };
  }

  let supabase;

  try {
    const hasil = await ambilAdmin();
    supabase = hasil.supabase;

    if (hasil.error || !hasil.user) {
      console.error("Tambah produk gagal: sesi admin tidak ditemukan.", hasil.error);
      return {
        error: "Sesi admin tidak ditemukan. Silakan masuk lagi.",
        sukses: "",
      };
    }
  } catch (error) {
    console.error("Tambah produk gagal saat memeriksa sesi:", error);
    return {
      error: "Sesi admin tidak ditemukan. Silakan masuk lagi.",
      sukses: "",
    };
  }

  try {
    const { error } = await supabase.from("produk").insert({
      nama,
      harga,
      kategori: kategori || null,
      foto_url: fotoUrl || null,
      deskripsi: deskripsi || null,
    });

    if (error) {
      console.error("Tambah produk gagal:", error.code, error.message);
      return {
        error: "Produk gagal disimpan. Coba lagi beberapa saat lagi.",
        sukses: "",
      };
    }
  } catch (error) {
    console.error("Tambah produk gagal:", error);
    return {
      error: "Produk gagal disimpan. Coba lagi beberapa saat lagi.",
      sukses: "",
    };
  }

  // Katalog publik dan daftar admin harus langsung menampilkan produk baru.
  revalidatePath("/");
  revalidatePath("/admin");

  redirect("/admin");
}

// US-09 (bonus): ubah data produk dari halaman admin.
// Periksa login di server, lalu perbarui lewat koneksi sesi admin sehingga
// aturan Row Level Security (admin_ubah_produk) tetap berlaku.
export async function ubahProduk(_keadaanSebelumnya, formData) {
  const idMentah = String(formData.get("id") ?? "").trim();
  const nama = String(formData.get("nama") ?? "").trim();
  const hargaMentah = String(formData.get("harga") ?? "").trim();
  const kategori = String(formData.get("kategori") ?? "").trim();
  const fotoUrl = String(formData.get("foto_url") ?? "").trim();
  const deskripsi = String(formData.get("deskripsi") ?? "").trim();

  if (!/^\d+$/.test(idMentah)) {
    return {
      error: "Produk tidak ditemukan. Pilih produk dari daftar lalu coba lagi.",
      sukses: "",
    };
  }

  if (!nama) {
    return { error: "Nama produk wajib diisi.", sukses: "" };
  }

  if (!hargaMentah) {
    return { error: "Harga wajib diisi.", sukses: "" };
  }

  const harga = Number(hargaMentah);

  if (!Number.isInteger(harga) || harga < 0) {
    return {
      error: "Harga harus berupa angka bulat dan tidak boleh negatif.",
      sukses: "",
    };
  }

  let supabase;

  try {
    const hasil = await ambilAdmin();
    supabase = hasil.supabase;

    if (hasil.error || !hasil.user) {
      console.error("Ubah produk gagal: sesi admin tidak ditemukan.", hasil.error);
      return {
        error: "Sesi admin tidak ditemukan. Silakan masuk lagi.",
        sukses: "",
      };
    }
  } catch (error) {
    console.error("Ubah produk gagal saat memeriksa sesi:", error);
    return {
      error: "Sesi admin tidak ditemukan. Silakan masuk lagi.",
      sukses: "",
    };
  }

  try {
    const { data, error } = await supabase
      .from("produk")
      .update({
        nama,
        harga,
        kategori: kategori || null,
        foto_url: fotoUrl || null,
        deskripsi: deskripsi || null,
      })
      .eq("id", Number(idMentah))
      .select("id");

    if (error) {
      console.error("Ubah produk gagal:", error.code, error.message);
      return {
        error: "Perubahan gagal disimpan. Coba lagi beberapa saat lagi.",
        sukses: "",
      };
    }

    if (!data || data.length === 0) {
      return {
        error: "Produk tidak ditemukan. Produk mungkin sudah dihapus.",
        sukses: "",
      };
    }
  } catch (error) {
    console.error("Ubah produk gagal:", error);
    return {
      error: "Perubahan gagal disimpan. Coba lagi beberapa saat lagi.",
      sukses: "",
    };
  }

  // Katalog publik, daftar admin, dan halaman detail harus langsung
  // menampilkan perubahan terbaru.
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/produk/${idMentah}`);

  redirect("/admin");
}

// US-10 (bonus): hapus produk dari daftar admin.
// Periksa login di server, lalu hapus lewat koneksi sesi admin sehingga
// aturan Row Level Security (admin_hapus_produk) tetap berlaku.
export async function hapusProduk(id) {
  const idMentah = String(id ?? "").trim();

  if (!/^\d+$/.test(idMentah)) {
    return {
      error: "Produk tidak ditemukan. Muat ulang halaman lalu coba lagi.",
    };
  }

  let supabase;

  try {
    const hasil = await ambilAdmin();
    supabase = hasil.supabase;

    if (hasil.error || !hasil.user) {
      console.error("Hapus produk gagal: sesi admin tidak ditemukan.", hasil.error);
      return { error: "Sesi admin tidak ditemukan. Silakan masuk lagi." };
    }
  } catch (error) {
    console.error("Hapus produk gagal saat memeriksa sesi:", error);
    return { error: "Sesi admin tidak ditemukan. Silakan masuk lagi." };
  }

  try {
    const { data, error } = await supabase
      .from("produk")
      .delete()
      .eq("id", Number(idMentah))
      .select("id");

    if (error) {
      console.error("Hapus produk gagal:", error.code, error.message);
      return { error: "Produk gagal dihapus. Coba lagi beberapa saat lagi." };
    }

    if (!data || data.length === 0) {
      return { error: "Produk tidak ditemukan. Mungkin sudah dihapus." };
    }
  } catch (error) {
    console.error("Hapus produk gagal:", error);
    return { error: "Produk gagal dihapus. Coba lagi beberapa saat lagi." };
  }

  // Katalog publik, daftar admin, dan halaman detail harus langsung
  // menampilkan produk terhapus.
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/produk/${idMentah}`);

  return { error: "" };
}

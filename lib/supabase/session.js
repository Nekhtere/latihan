import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Klien Supabase untuk sesi admin. Memakai publishable key dan cookie login,
// sehingga Row Level Security tetap berlaku. Hanya untuk Server Component,
// Server Action, dan Route Handler.
export async function buatKlienSesi() {
  const cookieStore = await cookies();
  const url = process.env.SUPABASE_URL;
  const kunci = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !kunci) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY harus diisi di environment variable."
    );
  }

  return createServerClient(url, kunci, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(daftarCookie) {
        try {
          daftarCookie.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component tidak bisa menulis cookie. Perubahan cookie
          // ditangani di Server Action atau Route Handler.
        }
      },
    },
  });
}

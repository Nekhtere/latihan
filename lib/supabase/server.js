import { createClient } from "@supabase/supabase-js";

// Klien Supabase khusus server. Memakai kunci rahasia, jadi file ini hanya
// boleh diimpor dari Server Component, Server Action, atau Route Handler.
// Jangan diimpor dari file yang memakai "use client".
export function buatKlienServer() {
  const url = process.env.SUPABASE_URL;
  const kunci = process.env.SUPABASE_SECRET_KEY;

  if (!url || !kunci) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY harus diisi di environment variable."
    );
  }

  return createClient(url, kunci, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

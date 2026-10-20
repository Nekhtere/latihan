import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

function alihkanKeLogin(request, response) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";

  const redirect = NextResponse.redirect(url, 303);

  // Bawa serta cookie sesi yang mungkin baru diperbarui oleh Supabase.
  response.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });

  return redirect;
}

export async function proxy(request) {
  const pathname = request.nextUrl.pathname;
  const halamanLogin = pathname === "/admin/login" || pathname === "/admin/login/";

  const url = process.env.SUPABASE_URL;
  const kunci = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !kunci) {
    console.error(
      "Proxy admin: SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY harus diisi di environment variable."
    );

    if (halamanLogin) {
      return NextResponse.next({ request });
    }

    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(url, kunci, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(daftarCookie) {
          daftarCookie.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          daftarCookie.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return halamanLogin ? response : alihkanKeLogin(request, response);
    }

    return response;
  } catch (error) {
    console.error("Proxy admin gagal memeriksa sesi:", error);

    if (halamanLogin) {
      return NextResponse.next({ request });
    }

    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

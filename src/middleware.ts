import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const MORADOR_COOKIE_NAME = "condo_morador_session";

function getSecretKey(): Uint8Array {
  const secret = process.env.MORADOR_SESSION_SECRET || "chave-secreta-padrao-condominio-aurora-2026-min-32-chars";
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignora arquivos estáticos, rotas internas do Next.js e endpoints de API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 1. Checa token de morador no cookie
  const moradorToken = request.cookies.get(MORADOR_COOKIE_NAME)?.value;
  let isMoradorAutenticado = false;

  if (moradorToken) {
    try {
      const { payload } = await jwtVerify(moradorToken, getSecretKey());
      if (payload.role === "morador") {
        isMoradorAutenticado = true;
      }
    } catch {
      isMoradorAutenticado = false;
    }
  }

  // 2. Checa token/cookie do Supabase Auth
  // Cookies do Supabase SSR geralmente começam com sb- ou sb:<project-ref>-auth-token
  const hasSupabaseCookie = Array.from(request.cookies.getAll()).some(
    (c) => c.name.startsWith("sb-") || c.name.includes("auth-token")
  );

  // Regra A: Proteção das rotas administrativas /admin/* (exceto /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Se for morador tentando acessar admin, barra e manda para o mural
    if (isMoradorAutenticado && !hasSupabaseCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/ocorrencias";
      url.searchParams.set("erro", "acesso_negado_morador");
      return NextResponse.redirect(url);
    }

    // Se não tiver cookie de funcionário, redireciona para o login do admin
    if (!hasSupabaseCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // Regra B: Proteção das rotas comunitárias (/ocorrencias, /nova-ocorrencia)
  if (
    pathname.startsWith("/ocorrencias") ||
    pathname.startsWith("/nova-ocorrencia")
  ) {
    if (!isMoradorAutenticado && !hasSupabaseCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Regra C: Redirecionamentos se já estiver logado
  if (pathname === "/login" && isMoradorAutenticado) {
    const url = request.nextUrl.clone();
    url.pathname = "/ocorrencias";
    return NextResponse.redirect(url);
  }

  if (pathname === "/admin/login" && hasSupabaseCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/ocorrencias/:path*",
    "/nova-ocorrencia/:path*",
    "/login",
  ],
};


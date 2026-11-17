import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { signMoradorToken } from "@/lib/auth/morador-session";

describe("Middleware de Proteção de Rotas e RBAC (middleware.ts)", () => {
  const validMorador = {
    id: "morador-uuid-1",
    nome: "Carlos Silva",
    email: "carlos@aurora.com",
    torre: "A",
    apartamento: "101",
    role: "morador" as const,
  };

  async function createMiddlewareRequest(
    urlPath: string,
    cookies: Record<string, string> = {}
  ): Promise<NextRequest> {
    const url = new URL(urlPath, "http://localhost:3000");
    const req = new NextRequest(url);
    for (const [name, val] of Object.entries(cookies)) {
      req.cookies.set(name, val);
    }
    return req;
  }

  it("[CRÍTICO] Bloqueia morador tentando acessar /admin e redireciona para /ocorrencias com erro", async () => {
    const token = await signMoradorToken(validMorador);
    const req = await createMiddlewareRequest("/admin/moradores", {
      condo_morador_session: token,
    });

    const res = await middleware(req);

    expect(res.status).toBe(307);
    const redirectUrl = new URL(res.headers.get("location") || "");
    expect(redirectUrl.pathname).toBe("/ocorrencias");
    expect(redirectUrl.searchParams.get("erro")).toBe("acesso_negado_morador");
  });

  it("[CRÍTICO] Redireciona usuário anônimo tentando acessar /admin para /admin/login", async () => {
    const req = await createMiddlewareRequest("/admin");
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const redirectUrl = new URL(res.headers.get("location") || "");
    expect(redirectUrl.pathname).toBe("/admin/login");
  });

  it("[CRÍTICO] Permite que funcionário com cookie do Supabase Auth acesse /admin", async () => {
    const req = await createMiddlewareRequest("/admin", {
      "sb-project-ref-auth-token": "valid-supabase-token-xyz",
    });

    const res = await middleware(req);
    // NextResponse.next() não gera redirecionamento (status 200)
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("[IMPORTANTE] Redireciona usuário anônimo em /ocorrencias para /login com parâmetro from", async () => {
    const req = await createMiddlewareRequest("/ocorrencias");
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const redirectUrl = new URL(res.headers.get("location") || "");
    expect(redirectUrl.pathname).toBe("/login");
    expect(redirectUrl.searchParams.get("from")).toBe("/ocorrencias");
  });

  it("[IMPORTANTE] Redireciona usuário anônimo em /nova-ocorrencia para /login com parâmetro from", async () => {
    const req = await createMiddlewareRequest("/nova-ocorrencia");
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const redirectUrl = new URL(res.headers.get("location") || "");
    expect(redirectUrl.pathname).toBe("/login");
    expect(redirectUrl.searchParams.get("from")).toBe("/nova-ocorrencia");
  });

  it("[IMPORTANTE] Redireciona morador já autenticado que visita /login para /ocorrencias", async () => {
    const token = await signMoradorToken(validMorador);
    const req = await createMiddlewareRequest("/login", {
      condo_morador_session: token,
    });

    const res = await middleware(req);

    expect(res.status).toBe(307);
    const redirectUrl = new URL(res.headers.get("location") || "");
    expect(redirectUrl.pathname).toBe("/ocorrencias");
  });

  it("[IMPORTANTE] Redireciona administrador com sessão ativa que visita /admin/login para /admin", async () => {
    const req = await createMiddlewareRequest("/admin/login", {
      "sb-aurora-auth-token": "token-funcionario",
    });

    const res = await middleware(req);

    expect(res.status).toBe(307);
    const redirectUrl = new URL(res.headers.get("location") || "");
    expect(redirectUrl.pathname).toBe("/admin");
  });

  it("[IMPORTANTE] Ignora chamadas de API e arquivos estáticos sem aplicar redirecionamento", async () => {
    const staticReq = await createMiddlewareRequest("/favicon.ico");
    const apiReq = await createMiddlewareRequest("/api/ocorrencias");

    const staticRes = await middleware(staticReq);
    const apiRes = await middleware(apiReq);

    expect(staticRes.status).toBe(200);
    expect(staticRes.headers.get("location")).toBeNull();
    expect(apiRes.status).toBe(200);
    expect(apiRes.headers.get("location")).toBeNull();
  });
});

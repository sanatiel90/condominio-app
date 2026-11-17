import { describe, it, expect, beforeEach, vi } from "vitest";
import { SignJWT } from "jose/jwt/sign";
import {
  signMoradorToken,
  verifyMoradorToken,
  setMoradorCookie,
  clearMoradorCookie,
  MORADOR_COOKIE_NAME,
} from "@/lib/auth/morador-session";
import { MoradorSession } from "@/types/database.types";

const mockCookieStore = new Map<string, any>();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => mockCookieStore.get(name),
    set: (name: string, value: string, options: any) => {
      mockCookieStore.set(name, { value, ...options });
    },
    getAll: () =>
      Array.from(mockCookieStore.entries()).map(([name, data]) => ({
        name,
        value: data.value,
      })),
  })),
}));

describe("Módulo de Sessão JWT do Morador (morador-session.ts)", () => {
  const mockMorador: MoradorSession = {
    id: "morador-uuid-123",
    nome: "Carlos Silva",
    email: "carlos.silva@aurora.com",
    torre: "Torre A",
    apartamento: "102",
    role: "morador",
  };

  beforeEach(() => {
    mockCookieStore.clear();
    vi.clearAllMocks();
  });

  it("[CRÍTICO] Deve assinar e verificar com sucesso um token válido de morador", async () => {
    const token = await signMoradorToken(mockMorador);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const verified = await verifyMoradorToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(mockMorador.id);
    expect(verified?.email).toBe(mockMorador.email);
    expect(verified?.role).toBe("morador");
    expect(verified?.torre).toBe("Torre A");
    expect(verified?.apartamento).toBe("102");
  });

  it("[CRÍTICO] Deve rejeitar token adulterado ou assinado com chave secreta diferente", async () => {
    const fakeSecret = new TextEncoder().encode(
      "chave-falsa-maliciosa-com-tamanho-suficiente"
    );
    const fakeToken = await new SignJWT({ ...mockMorador })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(fakeSecret);

    const result = await verifyMoradorToken(fakeToken);
    expect(result).toBeNull();
  });

  it("[CRÍTICO] Deve rejeitar token adulterado cujo payload declare role diferente de morador", async () => {
    const secret = new TextEncoder().encode(
      process.env.MORADOR_SESSION_SECRET ||
        "chave-secreta-desenvolvimento-condominio-aurora-min-32-chars"
    );

    // Invasor tentando injetar role de funcionario dentro do token assinado
    const forgedToken = await new SignJWT({
      ...mockMorador,
      role: "funcionario",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    const result = await verifyMoradorToken(forgedToken);
    expect(result).toBeNull();
  });

  it("[CRÍTICO] Deve rejeitar token expirado", async () => {
    const secret = new TextEncoder().encode(
      process.env.MORADOR_SESSION_SECRET ||
        "chave-secreta-desenvolvimento-condominio-aurora-min-32-chars"
    );

    const expiredToken = await new SignJWT({ ...mockMorador })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 1000)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 100)
      .sign(secret);

    const result = await verifyMoradorToken(expiredToken);
    expect(result).toBeNull();
  });

  it("[CRÍTICO] Deve configurar cookie com flags de segurança (httpOnly, sameSite lax, maxAge)", async () => {
    await setMoradorCookie(mockMorador);

    const cookie = mockCookieStore.get(MORADOR_COOKIE_NAME);
    expect(cookie).toBeDefined();
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe("lax");
    expect(cookie.path).toBe("/");
    expect(cookie.maxAge).toBe(60 * 60 * 24 * 30); // 30 dias

    const verified = await verifyMoradorToken(cookie.value);
    expect(verified?.id).toBe(mockMorador.id);
  });

  it("[CRÍTICO] Deve invalidar e limpar o cookie ao chamar clearMoradorCookie", async () => {
    await setMoradorCookie(mockMorador);
    expect(mockCookieStore.has(MORADOR_COOKIE_NAME)).toBe(true);

    await clearMoradorCookie();

    const clearedCookie = mockCookieStore.get(MORADOR_COOKIE_NAME);
    expect(clearedCookie.value).toBe("");
    expect(clearedCookie.maxAge).toBe(0);
    expect(clearedCookie.httpOnly).toBe(true);
  });
});

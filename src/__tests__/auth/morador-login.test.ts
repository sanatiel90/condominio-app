import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/morador-login/route";

// Mocks
const mockSetMoradorCookie = vi.fn();
vi.mock("@/lib/auth/morador-session", () => ({
  setMoradorCookie: (payload: any) => mockSetMoradorCookie(payload),
}));

const mockMaybeSingle = vi.fn();
const mockIlike = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = vi.fn(() => ({ ilike: mockIlike }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

describe("API Route: POST /api/auth/morador-login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(body: any): NextRequest {
    return new NextRequest("http://localhost:3000/api/auth/morador-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("[CRÍTICO] Deve bloquear morador com status inativo com HTTP 403 e não emitir cookie", async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: "morador-inativo-123",
        nome: "Morador Suspenso",
        email: "suspenso@aurora.com",
        torre: "Torre B",
        apartamento: "204",
        status: "inativo",
      },
      error: null,
    });

    const req = createRequest({ email: "suspenso@aurora.com" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toContain("Seu cadastro está inativo");
    expect(mockSetMoradorCookie).not.toHaveBeenCalled();
  });

  it("[CRÍTICO] Deve autenticar morador ativo com HTTP 200 e emitir o cookie seguro", async () => {
    const activeMorador = {
      id: "morador-ativo-789",
      nome: "Mariana Souza",
      email: "mariana@aurora.com",
      torre: "Torre A",
      apartamento: "501",
      status: "ativo",
    };

    mockMaybeSingle.mockResolvedValueOnce({
      data: activeMorador,
      error: null,
    });

    const req = createRequest({ email: "mariana@aurora.com" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.morador).toEqual({
      id: activeMorador.id,
      nome: activeMorador.nome,
      email: activeMorador.email,
      torre: activeMorador.torre,
      apartamento: activeMorador.apartamento,
      role: "morador",
    });

    expect(mockSetMoradorCookie).toHaveBeenCalledTimes(1);
    expect(mockSetMoradorCookie).toHaveBeenCalledWith({
      id: activeMorador.id,
      nome: activeMorador.nome,
      email: activeMorador.email,
      torre: activeMorador.torre,
      apartamento: activeMorador.apartamento,
      role: "morador",
    });
  });

  it("[IMPORTANTE] Deve retornar HTTP 404 quando o e-mail não estiver cadastrado no condomínio", async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const req = createRequest({ email: "desconhecido@outro.com" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toContain("E-mail não encontrado");
    expect(mockSetMoradorCookie).not.toHaveBeenCalled();
  });

  it("[IMPORTANTE] Deve normalizar o e-mail com trim e lowercase antes de consultar o banco", async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: "morador-123",
        nome: "João Silva",
        email: "joao.silva@aurora.com",
        torre: "Torre C",
        apartamento: "101",
        status: "ativo",
      },
      error: null,
    });

    const req = createRequest({ email: "   JoAo.SilVa@AURORA.COM   " });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockIlike).toHaveBeenCalledWith("email", "joao.silva@aurora.com");
  });

  it("[IMPORTANTE] Deve validar o formato do e-mail com Zod e retornar HTTP 400 sem tocar no banco", async () => {
    const invalidInputs = [
      { email: "" },
      { email: "email-invalido-sem-arroba" },
      {},
    ];

    for (const body of invalidInputs) {
      const req = createRequest(body);
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(mockFrom).not.toHaveBeenCalled();
      expect(mockSetMoradorCookie).not.toHaveBeenCalled();
    }
  });

  it("[IMPORTANTE] Deve tratar erro de conexão do banco e retornar HTTP 500 elegante", async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "Connection refused" },
    });

    const req = createRequest({ email: "falha.banco@aurora.com" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("Erro de conexão com o banco de dados");
    expect(mockSetMoradorCookie).not.toHaveBeenCalled();
  });
});

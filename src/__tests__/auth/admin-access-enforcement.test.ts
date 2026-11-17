import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as getMoradoresRoute } from "@/app/api/moradores/route";

// Mocks
const mockGetCurrentSession = vi.fn();
vi.mock("@/lib/auth/session-guard", () => ({
  getCurrentSession: () => mockGetCurrentSession(),
}));

const mockOrder = vi.fn();
const mockSelect = vi.fn(() => ({ order: mockOrder }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

describe("Enforcement de Permissões Administrativas (/api/moradores)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockOrder.mockResolvedValue({
      data: [{ id: "1", nome: "Morador Teste" }],
      error: null,
    });
  });

  function createRequest(): NextRequest {
    return new NextRequest("http://localhost:3000/api/moradores", {
      method: "GET",
    });
  }

  it("[CRÍTICO] Deve retornar HTTP 403 quando um morador tentar acessar API de moradores", async () => {
    mockGetCurrentSession.mockResolvedValueOnce({
      id: "morador-123",
      nome: "Morador Curioso",
      email: "morador@aurora.com",
      role: "morador",
    });

    const res = await getMoradoresRoute(createRequest());
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toContain("Acesso restrito à administração");
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("[CRÍTICO] Deve retornar HTTP 403 para invasor com cookies falsos ou token não autenticado", async () => {
    // Simula cookie presente no request mas que não valida no Supabase Auth
    mockGetCurrentSession.mockResolvedValueOnce(null);

    const res = await getMoradoresRoute(createRequest());
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toContain("Acesso restrito à administração");
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("[IMPORTANTE] Deve permitir o acesso quando o usuário for um funcionário autenticado", async () => {
    mockGetCurrentSession.mockResolvedValueOnce({
      id: "admin-456",
      nome: "Síndico Predial",
      email: "sindico@aurora.com",
      cargo: "Síndico",
      role: "funcionario",
    });

    const res = await getMoradoresRoute(createRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.moradores).toBeDefined();
    expect(mockFrom).toHaveBeenCalledWith("moradores");
  });
});

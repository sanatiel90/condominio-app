import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCurrentSession } from "@/lib/auth/session-guard";
import { GET as getMeRoute } from "@/app/api/auth/me/route";

// Mocks
const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

const mockFuncionarioMaybeSingle = vi.fn();
const mockFuncionarioEq = vi.fn(() => ({
  maybeSingle: mockFuncionarioMaybeSingle,
}));
const mockFuncionarioSelect = vi.fn(() => ({
  eq: mockFuncionarioEq,
}));
const mockFuncionarioUpsert = vi.fn();

const mockAdminFrom = vi.fn((table: string) => {
  if (table === "funcionarios") {
    return {
      select: mockFuncionarioSelect,
      upsert: mockFuncionarioUpsert,
    };
  }
  return {};
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}));

const mockGetMoradorSession = vi.fn();
vi.mock("@/lib/auth/morador-session", () => ({
  getMoradorSession: () => mockGetMoradorSession(),
}));

describe("Gerenciamento de Sessão Unificada (session-guard.ts e /api/auth/me)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockFuncionarioUpsert.mockResolvedValue({ error: null });
  });

  it("[CRÍTICO] Precedência: Sessão corporativa de funcionário deve ter prioridade sobre sessão de morador", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "admin-uuid-1",
          email: "sindico@aurora.com",
        },
      },
    });

    mockFuncionarioMaybeSingle.mockResolvedValue({
      data: {
        id: "admin-uuid-1",
        nome: "Síndico Geral",
        email: "sindico@aurora.com",
        cargo: "Síndico",
      },
    });

    mockGetMoradorSession.mockResolvedValue({
      id: "morador-uuid-99",
      nome: "Morador Outro",
      email: "morador@aurora.com",
      torre: "A",
      apartamento: "101",
      role: "morador",
    });

    const session = await getCurrentSession();

    expect(session).not.toBeNull();
    expect(session?.role).toBe("funcionario");
    expect(session?.id).toBe("admin-uuid-1");
    expect((session as any).cargo).toBe("Síndico");
    // Garante que nem tentou ler sessão de morador
    expect(mockGetMoradorSession).not.toHaveBeenCalled();
  });

  it("[IMPORTANTE] Retorna dados do funcionário cadastrado na tabela de funcionários", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "funcionario-uuid-2",
          email: "zelador@aurora.com",
        },
      },
    });

    mockFuncionarioMaybeSingle.mockResolvedValue({
      data: {
        id: "funcionario-uuid-2",
        nome: "João Zelador",
        email: "zelador@aurora.com",
        cargo: "Zeladoria",
      },
    });

    const session = await getCurrentSession();

    expect(session).toEqual({
      id: "funcionario-uuid-2",
      nome: "João Zelador",
      email: "zelador@aurora.com",
      cargo: "Zeladoria",
      role: "funcionario",
    });
    expect(mockFuncionarioUpsert).not.toHaveBeenCalled();
  });

  it("[IMPORTANTE] Auto-provisiona funcionário na base se o usuário existir no Supabase Auth mas não na tabela", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "novo-admin-uuid",
          email: "novo.admin@aurora.com",
          user_metadata: {
            nome: "Roberto Administrador",
            cargo: "Gerente Predial",
          },
        },
      },
    });

    mockFuncionarioMaybeSingle.mockResolvedValue({
      data: null, // Ainda não existe na tabela funcionarios
    });

    const session = await getCurrentSession();

    expect(mockFuncionarioUpsert).toHaveBeenCalledWith({
      id: "novo-admin-uuid",
      nome: "Roberto Administrador",
      email: "novo.admin@aurora.com",
      cargo: "Gerente Predial",
    });

    expect(session).toEqual({
      id: "novo-admin-uuid",
      nome: "Roberto Administrador",
      email: "novo.admin@aurora.com",
      cargo: "Gerente Predial",
      role: "funcionario",
    });
  });

  it("[IMPORTANTE] Deve resolver para morador quando não houver funcionário autenticado", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const moradorMock = {
      id: "morador-uuid-55",
      nome: "Ana Paula",
      email: "ana@aurora.com",
      torre: "B",
      apartamento: "302",
      role: "morador" as const,
    };
    mockGetMoradorSession.mockResolvedValue(moradorMock);

    const session = await getCurrentSession();

    expect(session).toEqual(moradorMock);
  });

  it("[IMPORTANTE] Deve retornar null quando nenhum usuário estiver autenticado", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });
    mockGetMoradorSession.mockResolvedValue(null);

    const session = await getCurrentSession();
    expect(session).toBeNull();
  });

  it("[IMPORTANTE] Rota /api/auth/me deve conter cabeçalhos no-store/anti-cache e retornar a sessão", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });
    const moradorMock = {
      id: "morador-uuid-77",
      nome: "Marcos Lima",
      email: "marcos@aurora.com",
      torre: "A",
      apartamento: "201",
      role: "morador" as const,
    };
    mockGetMoradorSession.mockResolvedValue(moradorMock);

    const res = await getMeRoute();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user).toEqual(moradorMock);
    expect(res.headers.get("Cache-Control")).toContain("no-store");
    expect(res.headers.get("Cache-Control")).toContain("no-cache");
    expect(res.headers.get("Pragma")).toBe("no-cache");
  });
});

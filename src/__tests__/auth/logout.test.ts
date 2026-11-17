import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST as logoutRoute } from "@/app/api/auth/logout/route";

const mockClearMoradorCookie = vi.fn();
vi.mock("@/lib/auth/morador-session", () => ({
  clearMoradorCookie: () => mockClearMoradorCookie(),
}));

const mockSignOut = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signOut: mockSignOut,
    },
  })),
}));

describe("API Route: POST /api/auth/logout", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("[CRÍTICO] Deve obrigatoriamente limpar o cookie de sessão do morador", async () => {
    mockSignOut.mockResolvedValueOnce({});

    const res = await logoutRoute();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockClearMoradorCookie).toHaveBeenCalledTimes(1);
  });

  it("[IMPORTANTE] Deve acionar signOut no Supabase Auth para revogar sessão corporativa", async () => {
    mockSignOut.mockResolvedValueOnce({});

    const res = await logoutRoute();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("[IMPORTANTE] Deve ser resiliente se o Supabase Auth falhar ou não houver sessão ativa", async () => {
    mockSignOut.mockRejectedValueOnce(new Error("Supabase Auth unreachable"));

    const res = await logoutRoute();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    // Mesmo com erro no signOut do Supabase, o cookie do morador deve ser limpo
    expect(mockClearMoradorCookie).toHaveBeenCalledTimes(1);
  });
});

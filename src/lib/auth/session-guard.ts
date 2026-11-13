import { getMoradorSession } from "./morador-session";
import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";
import { CurrentSession } from "@/types/database.types";

export async function getCurrentSession(): Promise<CurrentSession | null> {
  // 1. Verifica se há sessão de morador
  const morador = await getMoradorSession();
  if (morador) {
    return morador;
  }

  // 2. Verifica se há sessão do Supabase Auth (funcionário)
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && user.email) {
      const adminClient = createAdminClient();
      const { data: funcionario } = await adminClient
        .from("funcionarios")
        .select("id, nome, email, cargo")
        .eq("id", user.id)
        .single();

      if (funcionario) {
        return {
          id: funcionario.id,
          nome: funcionario.nome,
          email: funcionario.email,
          cargo: funcionario.cargo || "Administração",
          role: "funcionario",
        };
      }
    }
  } catch {
    // Supabase Auth não configurado ou sessão ausente
  }

  return null;
}


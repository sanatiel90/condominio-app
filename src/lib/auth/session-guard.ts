import { getMoradorSession } from "./morador-session";
import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";
import { CurrentSession } from "@/types/database.types";

export async function getCurrentSession(): Promise<CurrentSession | null> {
  // 1. Verifica primeiro se há sessão corporativa do Supabase Auth (funcionário/administrador)
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
        .maybeSingle();

      if (funcionario) {
        return {
          id: funcionario.id,
          nome: funcionario.nome,
          email: funcionario.email,
          cargo: funcionario.cargo || "Administração",
          role: "funcionario",
        };
      } else {
        // Auto-provisiona registro na tabela funcionarios caso o usuário exista no Supabase Auth
        const nomeBruto =
          user.user_metadata?.nome ||
          user.email.split("@")[0] ||
          "Administrador";
        const nome =
          typeof nomeBruto === "string"
            ? nomeBruto.replace(/[._-]/g, " ")
            : "Administrador";
        const cargo = (user.user_metadata?.cargo as string) || "Administração";

        try {
          await adminClient.from("funcionarios").upsert({
            id: user.id,
            nome,
            email: user.email,
            cargo,
          });
        } catch (upsertErr) {
          console.error("Erro ao provisionar funcionário:", upsertErr);
        }

        return {
          id: user.id,
          nome,
          email: user.email,
          cargo,
          role: "funcionario",
        };
      }
    }
  } catch {
    // Supabase Auth não configurado ou sessão ausente
  }

  // 2. Se não houver funcionário autenticado no Supabase Auth, verifica a sessão do morador
  const morador = await getMoradorSession();
  if (morador) {
    return morador;
  }

  return null;
}

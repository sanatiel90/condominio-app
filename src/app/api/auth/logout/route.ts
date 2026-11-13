import { NextResponse } from "next/server";
import { clearMoradorCookie } from "@/lib/auth/morador-session";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    // 1. Limpa o cookie de morador
    await clearMoradorCookie();

    // 2. Encerra a sessão do Supabase Auth (se for funcionário)
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignora se não houver sessão ativa
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erro no logout:", err);
    return NextResponse.json(
      { error: "Erro ao encerrar a sessão." },
      { status: 500 }
    );
  }
}


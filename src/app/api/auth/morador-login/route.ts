import { NextRequest, NextResponse } from "next/server";
import { moradorLoginSchema } from "@/lib/validations/morador.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { setMoradorCookie } from "@/lib/auth/morador-session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = moradorLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "E-mail inválido." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const supabase = createAdminClient();

    const { data: morador, error } = await supabase
      .from("moradores")
      .select("id, nome, email, torre, apartamento, status")
      .ilike("email", email)
      .maybeSingle();

    if (error) {
      console.error("Erro ao consultar morador no banco:", error);
      return NextResponse.json(
        { error: "Erro de conexão com o banco de dados. Tente novamente." },
        { status: 500 }
      );
    }

    if (!morador) {
      return NextResponse.json(
        {
          error:
            "E-mail não encontrado. Verifique a digitação ou procure a administração do condomínio para realizar seu cadastro.",
        },
        { status: 404 }
      );
    }

    if (morador.status !== "ativo") {
      return NextResponse.json(
        {
          error:
            "Seu cadastro está inativo. Entre em contato com a administração para reativar seu acesso.",
        },
        { status: 403 }
      );
    }

    // Emite o cookie seguro HTTP-only assinado
    await setMoradorCookie({
      id: morador.id,
      nome: morador.nome,
      email: morador.email,
      torre: morador.torre,
      apartamento: morador.apartamento,
      role: "morador",
    });

    return NextResponse.json({
      success: true,
      morador: {
        id: morador.id,
        nome: morador.nome,
        email: morador.email,
        torre: morador.torre,
        apartamento: morador.apartamento,
        role: "morador",
      },
    });
  } catch (err: any) {
    console.error("Erro inesperado no login do morador:", err);
    return NextResponse.json(
      { error: "Ocorreu um erro interno. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}


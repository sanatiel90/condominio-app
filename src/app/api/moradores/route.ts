import { NextRequest, NextResponse } from "next/server";
import { moradorFormSchema } from "@/lib/validations/morador.schema";
import { getCurrentSession } from "@/lib/auth/session-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "funcionario") {
      return NextResponse.json(
        { error: "Acesso restrito à administração do condomínio." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("busca")?.trim();
    const status = searchParams.get("status")?.trim();

    const supabase = createAdminClient();
    let query = supabase
      .from("moradores")
      .select("*")
      .order("nome", { ascending: true });

    if (status && (status === "ativo" || status === "inativo")) {
      query = query.eq("status", status);
    }

    if (search) {
      const sanitizedSearch = search.replace(/[,()"]/g, "").trim();
      if (sanitizedSearch) {
        query = query.or(
          `nome.ilike.%${sanitizedSearch}%,email.ilike.%${sanitizedSearch}%,apartamento.ilike.%${sanitizedSearch}%,torre.ilike.%${sanitizedSearch}%`
        );
      }
    }

    const { data: moradores, error } = await query;

    if (error) {
      console.error("Erro ao listar moradores:", error);
      return NextResponse.json(
        { error: "Erro ao buscar moradores no banco de dados." },
        { status: 500 }
      );
    }

    return NextResponse.json({ moradores: moradores || [] });
  } catch (err: any) {
    console.error("Erro inesperado em GET /api/moradores:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "funcionario") {
      return NextResponse.json(
        {
          error:
            "Apenas funcionários da administração podem cadastrar novos moradores.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = moradorFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const { nome, email, torre, apartamento, telefone, status } = parsed.data;
    const emailLower = email.toLowerCase().trim();
    const supabase = createAdminClient();

    // 1. Verifica unicidade do e-mail
    const { data: existente } = await supabase
      .from("moradores")
      .select("id")
      .ilike("email", emailLower)
      .maybeSingle();

    if (existente) {
      return NextResponse.json(
        {
          error:
            "Já existe um morador cadastrado com este e-mail no condomínio.",
        },
        { status: 409 }
      );
    }

    // 2. Insere o novo morador
    const { data: novoMorador, error: insertError } = await supabase
      .from("moradores")
      .insert({
        nome: nome.trim(),
        email: emailLower,
        torre: torre.trim(),
        apartamento: apartamento.trim(),
        telefone: telefone.trim(),
        status: status || "ativo",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erro ao inserir morador:", insertError);
      return NextResponse.json(
        { error: "Falha ao gravar morador no banco de dados." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      morador: novoMorador,
    });
  } catch (err: any) {
    console.error("Erro inesperado em POST /api/moradores:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { ocorrenciaFormSchema } from "@/lib/validations/ocorrencia.schema";
import { getCurrentSession } from "@/lib/auth/session-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria")?.trim();
    const status = searchParams.get("status")?.trim();
    const busca = searchParams.get("busca")?.trim();

    const supabase = createAdminClient();

    let query = supabase
      .from("ocorrencias")
      .select("*, comentarios(count)")
      .order("created_at", { ascending: false });

    if (categoria && categoria !== "todas") {
      query = query.eq("categoria", categoria);
    }

    if (status && status !== "todos") {
      query = query.eq("status", status);
    }

    if (busca) {
      query = query.or(
        `titulo.ilike.%${busca}%,local.ilike.%${busca}%,descricao.ilike.%${busca}%`
      );
    }

    const { data: ocorrencias, error } = await query;

    if (error) {
      console.error("Erro ao consultar ocorrências:", error);
      return NextResponse.json(
        { error: "Erro ao buscar ocorrências no banco de dados." },
        { status: 500 }
      );
    }

    // Normaliza a contagem de comentários
    const ocorrenciasFormatadas = (ocorrencias || []).map((item: any) => ({
      ...item,
      comentarios_count: item.comentarios?.[0]?.count || 0,
    }));

    return NextResponse.json({ ocorrencias: ocorrenciasFormatadas });
  } catch (err: any) {
    console.error("Erro inesperado em GET /api/ocorrencias:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validação de sessão do autor
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: "Acesso não autorizado. Faça login para registrar uma ocorrência." },
        { status: 401 }
      );
    }

    // 2. Validação do payload
    const body = await request.json();
    const parsed = ocorrenciaFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados incompletos." },
        { status: 400 }
      );
    }

    const { titulo, categoria, local, descricao, foto_url } = parsed.data;
    const supabase = createAdminClient();

    const isMorador = session.role === "morador";
    const moradorId = isMorador ? session.id : null;
    const funcionarioId = !isMorador ? session.id : null;
    const unidadeAutor = isMorador
      ? `${session.torre} - Apto ${session.apartamento}`
      : "Administração";

    // 3. Inserção no banco de dados com status inicial 'Aberta'
    const { data: novaOcorrencia, error: insertError } = await supabase
      .from("ocorrencias")
      .insert({
        titulo: titulo.trim(),
        categoria,
        local: local.trim(),
        descricao: descricao.trim(),
        foto_url: foto_url || null,
        status: "Aberta",
        autor_tipo: session.role,
        morador_id: moradorId,
        funcionario_id: funcionarioId,
        nome_autor: session.nome,
        unidade_autor: unidadeAutor,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erro ao gravar ocorrência:", insertError);
      return NextResponse.json(
        { error: "Falha ao registrar ocorrência no banco de dados." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ocorrencia: novaOcorrencia,
    });
  } catch (err: any) {
    console.error("Erro inesperado em POST /api/ocorrencias:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}


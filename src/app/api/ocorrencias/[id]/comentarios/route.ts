import { NextRequest, NextResponse } from "next/server";
import { comentarioSchema } from "@/lib/validations/comentario.schema";
import { getCurrentSession } from "@/lib/auth/session-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: comentarios, error } = await supabase
      .from("comentarios")
      .select("*")
      .eq("ocorrencia_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao listar comentários:", error);
      return NextResponse.json(
        { error: "Erro ao buscar comentários da ocorrência." },
        { status: 500 }
      );
    }

    return NextResponse.json({ comentarios: comentarios || [] });
  } catch (err: any) {
    console.error("Erro em GET comentários:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { error: "Você precisa estar conectado para comentar." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = comentarioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Comentário inválido." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const isMorador = session.role === "morador";
    const unidadeAutor = isMorador
      ? `${session.torre} - Apto ${session.apartamento}`
      : "Administração";

    const { data: novoComentario, error: insertError } = await supabase
      .from("comentarios")
      .insert({
        ocorrencia_id: id,
        conteudo: parsed.data.conteudo.trim(),
        autor_tipo: session.role,
        morador_id: isMorador ? session.id : null,
        funcionario_id: !isMorador ? session.id : null,
        nome_autor: session.nome,
        unidade_autor: unidadeAutor,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erro ao inserir comentário:", insertError);
      return NextResponse.json(
        { error: "Erro ao gravar comentário no banco de dados." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comentario: novoComentario,
    });
  } catch (err: any) {
    console.error("Erro em POST comentário:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}


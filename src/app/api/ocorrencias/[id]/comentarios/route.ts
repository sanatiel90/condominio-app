import { NextRequest, NextResponse } from "next/server";
import {
  comentarioSchema,
  deleteComentarioSchema,
} from "@/lib/validations/comentario.schema";
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ocorrenciaId } = await params;
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { error: "Você precisa estar conectado para excluir um comentário." },
        { status: 401 }
      );
    }

    if (session.role !== "morador") {
      return NextResponse.json(
        {
          error:
            "Apenas o morador autor pode excluir seu próprio comentário por este canal.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = deleteComentarioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message || "Dados de exclusão inválidos.",
        },
        { status: 400 }
      );
    }

    const { comentarioId } = parsed.data;
    const supabase = createAdminClient();

    // 1. Validar status da ocorrência (não pode estar resolvida ou cancelada)
    const { data: ocorrencia, error: ocorrenciaError } = await supabase
      .from("ocorrencias")
      .select("id, status")
      .eq("id", ocorrenciaId)
      .single();

    if (ocorrenciaError || !ocorrencia) {
      return NextResponse.json(
        { error: "Ocorrência não encontrada." },
        { status: 404 }
      );
    }

    const statusLower = ocorrencia.status?.toLowerCase();
    if (statusLower === "resolvida" || statusLower === "cancelada") {
      return NextResponse.json(
        {
          error:
            "Não é permitido excluir comentários em ocorrências finalizadas ou canceladas.",
        },
        { status: 400 }
      );
    }

    // 2. Buscar comentário e validar autoria e pertinência
    const { data: comentario, error: comentarioError } = await supabase
      .from("comentarios")
      .select("*")
      .eq("id", comentarioId)
      .eq("ocorrencia_id", ocorrenciaId)
      .single();

    if (comentarioError || !comentario) {
      return NextResponse.json(
        { error: "Comentário não encontrado nesta ocorrência." },
        { status: 404 }
      );
    }

    if (comentario.morador_id !== session.id) {
      return NextResponse.json(
        {
          error:
            "Você só tem permissão para excluir seus próprios comentários.",
        },
        { status: 403 }
      );
    }

    if (comentario.deleted_at) {
      return NextResponse.json({
        success: true,
        message: "Comentário já foi removido.",
      });
    }

    // 3. Efetuar Soft Delete com sanitização definitiva do conteúdo
    const nowIso = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("comentarios")
      .update({
        conteudo: "[Comentário removido pelo autor]",
        deleted_at: nowIso,
      })
      .eq("id", comentarioId);

    if (updateError) {
      console.error("Erro ao excluir comentário:", updateError);
      return NextResponse.json(
        {
          error:
            "Erro ao processar a exclusão do comentário no banco de dados.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Comentário excluído com sucesso.",
    });
  } catch (err: any) {
    console.error("Erro em DELETE comentário:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

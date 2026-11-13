import { NextRequest, NextResponse } from "next/server";
import { ocorrenciaStatusSchema } from "@/lib/validations/ocorrencia.schema";
import { getCurrentSession } from "@/lib/auth/session-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: ocorrencia, error } = await supabase
      .from("ocorrencias")
      .select("*, comentarios(count)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar ocorrência:", error);
      return NextResponse.json(
        { error: "Erro ao buscar detalhes da ocorrência." },
        { status: 500 }
      );
    }

    if (!ocorrencia) {
      return NextResponse.json(
        { error: "Ocorrência não encontrada." },
        { status: 404 }
      );
    }

    const formatada = {
      ...ocorrencia,
      comentarios_count: ocorrencia.comentarios?.[0]?.count || 0,
    };

    return NextResponse.json({ ocorrencia: formatada });
  } catch (err: any) {
    console.error("Erro inesperado em GET /api/ocorrencias/[id]:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();

    // Regra estrita: apenas funcionários autenticados podem alterar status
    if (!session || session.role !== "funcionario") {
      return NextResponse.json(
        { error: "Apenas funcionários da administração possuem permissão para alterar o status." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = ocorrenciaStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Status inválido." },
        { status: 400 }
      );
    }

    const { status: novoStatus, observacao } = parsed.data;
    const supabase = createAdminClient();

    // 1. Obtém o status anterior
    const { data: ocorrenciaAtual, error: getError } = await supabase
      .from("ocorrencias")
      .select("status")
      .eq("id", id)
      .single();

    if (getError || !ocorrenciaAtual) {
      return NextResponse.json(
        { error: "Ocorrência não encontrada para atualização." },
        { status: 404 }
      );
    }

    const statusAnterior = ocorrenciaAtual.status;

    // 2. Atualiza status da ocorrência
    const { data: atualizada, error: updateError } = await supabase
      .from("ocorrencias")
      .update({
        status: novoStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erro ao atualizar status:", updateError);
      return NextResponse.json(
        { error: "Erro ao atualizar status da ocorrência." },
        { status: 500 }
      );
    }

    // 3. Registra na tabela historico_status_ocorrencias
    await supabase.from("historico_status_ocorrencias").insert({
      ocorrencia_id: id,
      status_anterior: statusAnterior,
      status_novo: novoStatus,
      funcionario_id: session.id,
      observacao: observacao || `Status alterado de ${statusAnterior} para ${novoStatus} por ${session.nome}.`,
    });

    return NextResponse.json({
      success: true,
      ocorrencia: atualizada,
    });
  } catch (err: any) {
    console.error("Erro em PATCH /api/ocorrencias/[id]:", err);
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
    const { id } = await params;
    const session = await getCurrentSession();

    if (!session || session.role !== "funcionario") {
      return NextResponse.json(
        { error: "Apenas funcionários podem moderar ou cancelar ocorrências." },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();

    // Atualiza para 'Cancelada' conforme regra do PRD
    const { data: cancelada, error } = await supabase
      .from("ocorrencias")
      .update({
        status: "Cancelada",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao cancelar ocorrência:", error);
      return NextResponse.json(
        { error: "Erro ao cancelar ocorrência." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ocorrencia: cancelada,
    });
  } catch (err: any) {
    console.error("Erro em DELETE /api/ocorrencias/[id]:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}


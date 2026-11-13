import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Total de ocorrências
    const { count: total, error: errTotal } = await supabase
      .from("ocorrencias")
      .select("*", { count: "exact", head: true });

    // 2. Pendentes ou Em Análise
    const { count: pendentes, error: errPendentes } = await supabase
      .from("ocorrencias")
      .select("*", { count: "exact", head: true })
      .in("status", ["Aberta", "Em Análise"]);

    // 3. Resolvidas
    const { count: resolvidas, error: errResolvidas } = await supabase
      .from("ocorrencias")
      .select("*", { count: "exact", head: true })
      .eq("status", "Resolvida");

    // 4. Em Andamento
    const { count: emAndamento } = await supabase
      .from("ocorrencias")
      .select("*", { count: "exact", head: true })
      .eq("status", "Em Andamento");

    if (errTotal || errPendentes || errResolvidas) {
      console.error("Erro ao calcular métricas:", { errTotal, errPendentes, errResolvidas });
    }

    return NextResponse.json({
      total: total || 0,
      pendentes: pendentes || 0,
      emAndamento: emAndamento || 0,
      resolvidas: resolvidas || 0,
    });
  } catch (err: any) {
    console.error("Erro em GET /api/admin/metricas:", err);
    return NextResponse.json(
      { total: 0, pendentes: 0, emAndamento: 0, resolvidas: 0 },
      { status: 500 }
    );
  }
}


"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  Search, 
  Eye, 
  SlidersHorizontal 
} from "lucide-react";
import { KpiCard } from "@/components/admin/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { CategoryBadge } from "@/components/shared/category-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOcorrencias, useAdminMetricas } from "@/hooks/use-ocorrencias";
import { CATEGORIAS_OCORRENCIA, STATUS_OCORRENCIA } from "@/lib/validations/ocorrencia.schema";
import { formatarData } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [status, setStatusFiltro] = useState("");

  const { data: metricas, isLoading: loadingMetricas } = useAdminMetricas();
  const { ocorrencias, isLoading: loadingOcorrencias } = useOcorrencias({
    busca,
    categoria,
    status,
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#181C1E]">
          Gestão de Ocorrências
        </h1>
        <p className="text-sm text-[#545F72] mt-0.5">
          Centro de controle administrativo para triagem, acompanhamento e resolução de chamados.
        </p>
      </div>

      {/* Cards de Métricas (KPIs no topo) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Total de Ocorrências"
          value={loadingMetricas ? "..." : metricas?.total ?? 0}
          icon={<ClipboardList className="w-5 h-5" />}
          description="Histórico geral do condomínio"
        />
        <KpiCard
          label="Pendentes / Em Análise"
          value={loadingMetricas ? "..." : metricas?.pendentes ?? 0}
          icon={<Clock className="w-5 h-5" />}
          description="Aguardando ação da equipe"
        />
        <KpiCard
          label="Resolvidas (Total)"
          value={loadingMetricas ? "..." : metricas?.resolvidas ?? 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          description="Chamados concluídos"
        />
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-[#EDF2F7] shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="ID, Local ou Descrição..."
            className="pl-10 h-10 text-xs"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="h-10 px-3 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#181C1E] focus:outline-hidden focus:border-[#0F4C81] w-full sm:w-auto"
          >
            <option value="">Todos os Status</option>
            {STATUS_OCORRENCIA.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="h-10 px-3 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#181C1E] focus:outline-hidden focus:border-[#0F4C81] w-full sm:w-auto"
          >
            <option value="">Todas as Categorias</option>
            {CATEGORIAS_OCORRENCIA.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Ocorrências Rica */}
      <div className="bg-white rounded-xl border border-[#EDF2F7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EDF2F7] bg-[#F7FAFC] text-[11px] font-bold uppercase tracking-wider text-[#545F72]">
                <th className="py-3 px-5">ID</th>
                <th className="py-3 px-5">Categoria / Título</th>
                <th className="py-3 px-5">Local</th>
                <th className="py-3 px-5">Data</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF2F7] text-sm text-[#181C1E]">
              {loadingOcorrencias ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-[#545F72]">
                    <div className="inline-block animate-spin rounded-full h-7 w-7 border-4 border-[#0F4C81] border-t-transparent" />
                    <p className="mt-2">Carregando chamados...</p>
                  </td>
                </tr>
              ) : ocorrencias.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-[#545F72]">
                    Nenhuma ocorrência encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                ocorrencias.map((oc) => (
                  <tr
                    key={oc.id}
                    className="hover:bg-[#F7FAFC]/80 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-[#0F4C81]">
                      #OC-{oc.id.substring(0, 5).toUpperCase()}
                    </td>

                    {/* Categoria e Título */}
                    <td className="py-3.5 px-5 max-w-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <CategoryBadge categoria={oc.categoria} />
                      </div>
                      <div className="font-semibold text-[#181C1E] line-clamp-1">
                        {oc.titulo}
                      </div>
                      <div className="text-xs text-[#545F72] truncate">
                        Por {oc.nome_autor}
                      </div>
                    </td>

                    {/* Local */}
                    <td className="py-3.5 px-5 text-xs text-[#545F72] max-w-[160px] truncate">
                      {oc.local}
                    </td>

                    {/* Data */}
                    <td className="py-3.5 px-5 text-xs text-[#545F72] whitespace-nowrap">
                      {formatarData(oc.created_at)}
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <StatusBadge status={oc.status} />
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <Link
                        href={`/ocorrencias/${oc.id}`}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-[#00355F] bg-[#F1F4F6] hover:bg-[#E2E8F0] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Detalhe
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela */}
        <div className="py-3 px-5 bg-[#F7FAFC] border-t border-[#EDF2F7] text-xs text-[#545F72] flex justify-between items-center">
          <span>Mostrando {ocorrencias.length} resultado(s)</span>
        </div>
      </div>
    </div>
  );
}


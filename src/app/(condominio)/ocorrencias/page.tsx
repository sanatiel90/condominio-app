"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PlusCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OcorrenciaCard } from "@/components/ocorrencias/ocorrencia-card";
import { OcorrenciaFilters } from "@/components/ocorrencias/ocorrencia-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { useOcorrencias } from "@/hooks/use-ocorrencias";

export default function MuralOcorrenciasPage() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [status, setStatusFiltro] = useState("");

  const { ocorrencias, isLoading, error, refetch } = useOcorrencias({
    busca,
    categoria,
    status,
  });

  const handleResetFilters = () => {
    setBusca("");
    setCategoria("");
    setStatusFiltro("");
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#181C1E]">
            Mural de Ocorrências
          </h1>
          <p className="text-sm text-[#545F72] mt-0.5">
            Acompanhe o andamento dos chamados e manutenções do Residencial Aurora.
          </p>
        </div>

        <Link
          href="/nova-ocorrencia"
          className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-[#00355F] text-white text-sm font-semibold hover:bg-[#0F4C81] transition-all shadow-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Registrar Ocorrência
        </Link>
      </div>

      {/* Barra de Filtros Reativa */}
      <OcorrenciaFilters
        busca={busca}
        onBuscaChange={setBusca}
        categoria={categoria}
        onCategoriaChange={setCategoria}
        status={status}
        onStatusChange={setStatusFiltro}
        onReset={handleResetFilters}
      />

      {/* Estado de Carregamento (Skeletons) */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#EDF2F7] p-5 shadow-xs animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-[#E2E8F0] rounded-full" />
                <div className="h-4 w-20 bg-[#E2E8F0] rounded-md" />
              </div>
              <div className="h-6 w-3/4 bg-[#E2E8F0] rounded-md" />
              <div className="h-4 w-1/2 bg-[#E2E8F0] rounded-md" />
              <div className="h-16 w-full bg-[#E2E8F0] rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Estado de Erro */}
      {error && !isLoading && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center text-rose-800">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h3 className="font-semibold text-base mb-1">
            Falha ao carregar as ocorrências
          </h3>
          <p className="text-sm text-rose-700 max-w-md mx-auto mb-4">
            Não foi possível se comunicar com o banco de dados. Verifique sua conexão e tente novamente.
          </p>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="gap-2 text-rose-800 border-rose-300 hover:bg-rose-100"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Listagem de Ocorrências */}
      {!isLoading && !error && ocorrencias.length > 0 && (
        <div className="space-y-4">
          {ocorrencias.map((ocorrencia) => (
            <OcorrenciaCard key={ocorrencia.id} ocorrencia={ocorrencia} />
          ))}
        </div>
      )}

      {/* Estado Vazio */}
      {!isLoading && !error && ocorrencias.length === 0 && (
        <EmptyState
          title={
            busca || categoria || status
              ? "Nenhuma ocorrência encontrada"
              : "Nenhuma ocorrência aberta no momento"
          }
          description={
            busca || categoria || status
              ? "Tente ajustar ou limpar os filtros de categoria e status para visualizar outros chamados."
              : "Tudo tranquilo por aqui! Se houver algum problema no condomínio, clique abaixo para abrir uma nova ocorrência."
          }
          action={
            busca || categoria || status ? (
              <Button variant="outline" onClick={handleResetFilters}>
                Limpar Filtros
              </Button>
            ) : (
              <Link
                href="/nova-ocorrencia"
                className="inline-flex items-center gap-2 h-11 px-4 rounded-lg bg-[#00355F] text-white text-sm font-semibold hover:bg-[#0F4C81] transition-all shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                Registrar Primeira Ocorrência
              </Link>
            )
          }
        />
      )}
    </div>
  );
}


"use client";

import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIAS_OCORRENCIA, STATUS_OCORRENCIA } from "@/lib/validations/ocorrencia.schema";

interface OcorrenciaFiltersProps {
  busca: string;
  onBuscaChange: (val: string) => void;
  categoria: string;
  onCategoriaChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  onReset: () => void;
}

export function OcorrenciaFilters({
  busca,
  onBuscaChange,
  categoria,
  onCategoriaChange,
  status,
  onStatusChange,
  onReset,
}: OcorrenciaFiltersProps) {
  const hasActiveFilters = Boolean(busca || categoria || status);

  return (
    <div className="bg-white p-4 rounded-xl border border-[#EDF2F7] shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* Campo de Busca Textual */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <Input
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="Buscar por título, local ou detalhes..."
          className="pl-10 h-10 text-xs"
        />
      </div>

      {/* Filtros Dropdown */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        <select
          value={categoria}
          onChange={(e) => onCategoriaChange(e.target.value)}
          className="h-10 px-3 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#181C1E] focus:outline-hidden focus:border-[#0F4C81] w-full sm:w-auto"
        >
          <option value="">Todas as Categorias</option>
          {CATEGORIAS_OCORRENCIA.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-10 px-3 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#181C1E] focus:outline-hidden focus:border-[#0F4C81] w-full sm:w-auto"
        >
          <option value="">Todos os Status</option>
          {STATUS_OCORRENCIA.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-10 px-3 text-xs text-[#545F72] hover:text-[#181C1E] gap-1 shrink-0"
            title="Limpar todos os filtros"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}


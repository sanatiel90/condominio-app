"use client";

import React from "react";
import Link from "next/link";
import { Ocorrencia } from "@/types/database.types";
import { StatusBadge } from "@/components/shared/status-badge";
import { CategoryBadge } from "@/components/shared/category-badge";
import { MapPin, MessageSquare, Calendar, Image as ImageIcon } from "lucide-react";
import { formatarData } from "@/lib/utils";

interface OcorrenciaCardProps {
  ocorrencia: Ocorrencia;
}

export function OcorrenciaCard({ ocorrencia }: OcorrenciaCardProps) {
  return (
    <Link
      href={`/ocorrencias/${ocorrencia.id}`}
      className="block group rounded-xl border border-[#EDF2F7] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all hover:border-[#CBD5E1] hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge categoria={ocorrencia.categoria} />
          <StatusBadge status={ocorrencia.status} />
        </div>
        <span className="text-xs text-[#545F72] flex items-center gap-1 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
          {formatarData(ocorrencia.created_at)}
        </span>
      </div>

      <h3 className="font-heading text-base font-semibold text-[#181C1E] group-hover:text-[#00355F] transition-colors mb-1.5 leading-snug line-clamp-2">
        {ocorrencia.titulo}
      </h3>

      <div className="flex items-center gap-1.5 text-xs text-[#545F72] mb-3">
        <MapPin className="w-3.5 h-3.5 text-[#0F4C81] shrink-0" />
        <span className="truncate">{ocorrencia.local}</span>
      </div>

      <p className="text-sm text-[#42474F] line-clamp-2 mb-4 leading-relaxed">
        {ocorrencia.descricao}
      </p>

      {/* Miniatura da foto se houver */}
      {ocorrencia.foto_url && (
        <div className="mb-4 overflow-hidden rounded-lg border border-[#EDF2F7] bg-[#F1F4F6] max-h-44 flex items-center justify-center">
          <img
            src={ocorrencia.foto_url}
            alt={ocorrencia.titulo}
            className="w-full h-36 object-cover transition-transform group-hover:scale-102"
            loading="lazy"
          />
        </div>
      )}

      {/* Rodapé com Autor e Comentários */}
      <div className="pt-3 border-t border-[#EDF2F7] flex items-center justify-between text-xs text-[#545F72]">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-[#181C1E] truncate">
            {ocorrencia.nome_autor}
          </span>
          {ocorrencia.unidade_autor && (
            <span className="text-[#94A3B8] text-[11px] truncate">
              · {ocorrencia.unidade_autor}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {ocorrencia.foto_url && (
            <span className="inline-flex items-center gap-1 text-[#545F72]" title="Possui foto">
              <ImageIcon className="w-3.5 h-3.5 text-[#94A3B8]" />
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-medium text-[#0F4C81]">
            <MessageSquare className="w-3.5 h-3.5" />
            {ocorrencia.comentarios_count || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}


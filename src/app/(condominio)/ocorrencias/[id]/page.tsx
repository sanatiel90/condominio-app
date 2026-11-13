"use client";

import React, { useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Settings2, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { CategoryBadge } from "@/components/shared/category-badge";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import { ComentariosThread } from "@/components/ocorrencias/comentarios-thread";
import { StatusUpdateDialog } from "@/components/admin/status-update-dialog";
import { useOcorrenciaDetalhe } from "@/hooks/use-ocorrencias";
import { useSession } from "@/hooks/use-session";
import { formatarData } from "@/lib/utils";
import { StatusOcorrencia } from "@/types/database.types";

function OcorrenciaDetalhesContent() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";

  const { isFuncionario } = useSession();
  const [dialogStatusAberto, setDialogStatusAberto] = useState(false);

  const {
    ocorrencia,
    isLoadingOcorrencia,
    errorOcorrencia,
    comentarios,
    isLoadingComentarios,
    addComentario,
    updateStatus,
  } = useOcorrenciaDetalhe(id);

  if (isLoadingOcorrencia) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0F4C81] border-t-transparent" />
        <p className="mt-3 text-sm text-[#545F72]">Carregando detalhes da ocorrência...</p>
      </div>
    );
  }

  if (errorOcorrencia || !ocorrencia) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="bg-white rounded-xl border border-[#EDF2F7] p-8 shadow-xs">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h2 className="font-heading text-lg font-bold text-[#181C1E] mb-1">
            Ocorrência não encontrada
          </h2>
          <p className="text-sm text-[#545F72] mb-6">
            O registro solicitado não existe ou pode ter sido removido.
          </p>
          <Link
            href="/ocorrencias"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#00355F] text-white text-xs font-semibold hover:bg-[#0F4C81]"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Mural
          </Link>
        </div>
      </div>
    );
  }

  const handleConfirmStatus = async (
    novoStatus: StatusOcorrencia,
    observacao?: string
  ) => {
    await updateStatus.mutateAsync({ status: novoStatus, observacao });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Barra Superior de Navegação */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/ocorrencias"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#545F72] hover:text-[#00355F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Mural
        </Link>

        {/* Controles de Moderação Exclusivos para Funcionários */}
        {isFuncionario && (
          <Button
            size="sm"
            onClick={() => setDialogStatusAberto(true)}
            className="gap-1.5 text-xs font-semibold bg-[#0F4C81] hover:bg-[#00355F]"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Alterar Status
          </Button>
        )}
      </div>

      {/* Card Principal da Ocorrência */}
      <div className="bg-white rounded-xl border border-[#EDF2F7] shadow-xs p-6 sm:p-8 space-y-6">
        {/* Cabeçalho */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EDF2F7] pb-4">
            <div className="flex items-center gap-2">
              <CategoryBadge categoria={ocorrencia.categoria} />
              <StatusBadge status={ocorrencia.status} />
            </div>

            <span className="text-xs font-mono font-medium text-[#94A3B8]">
              #{ocorrencia.id.substring(0, 8).toUpperCase()}
            </span>
          </div>

          <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#181C1E] leading-snug">
            {ocorrencia.titulo}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#545F72] pt-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0F4C81]" />
              <span className="font-medium text-[#181C1E]">{ocorrencia.local}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>{formatarData(ocorrencia.created_at)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>
                Reportado por <strong>{ocorrencia.nome_autor}</strong>
                {ocorrencia.unidade_autor && ` (${ocorrencia.unidade_autor})`}
              </span>
            </div>
          </div>
        </div>

        {/* Descrição Detalhada */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#545F72]">
            Descrição do Problema
          </h2>
          <div className="p-4 rounded-xl bg-[#F7FAFC] border border-[#EDF2F7] text-sm text-[#181C1E] leading-relaxed whitespace-pre-wrap">
            {ocorrencia.descricao}
          </div>
        </div>

        {/* Foto Anexa com Lightbox */}
        {ocorrencia.foto_url && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#545F72]">
              Foto Comprobatória Anexada
            </h2>
            <ImageLightbox
              src={ocorrencia.foto_url}
              alt={ocorrencia.titulo}
            />
          </div>
        )}

        {/* Thread de Comentários */}
        <div className="pt-6 border-t border-[#EDF2F7]">
          <ComentariosThread
            comentarios={comentarios}
            onAddComentario={(conteudo) => addComentario.mutateAsync(conteudo)}
            isLoading={isLoadingComentarios}
          />
        </div>
      </div>

      {/* Modal de Gestão de Status para Funcionários */}
      {isFuncionario && (
        <StatusUpdateDialog
          open={dialogStatusAberto}
          onOpenChange={setDialogStatusAberto}
          statusAtual={ocorrencia.status}
          onConfirm={handleConfirmStatus}
          isLoading={updateStatus.isPending}
        />
      )}
    </div>
  );
}

export default function OcorrenciaDetalhesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto py-12 text-center text-sm text-[#545F72]">
          Carregando ocorrência...
        </div>
      }
    >
      <OcorrenciaDetalhesContent />
    </Suspense>
  );
}

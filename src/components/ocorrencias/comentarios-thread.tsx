"use client";

import React, { useState } from "react";
import { Comentario, StatusOcorrencia } from "@/types/database.types";
import {
  MessageSquare,
  Send,
  ShieldCheck,
  User,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatarData, cn } from "@/lib/utils";

interface ComentariosThreadProps {
  comentarios: Comentario[];
  onAddComentario: (conteudo: string) => Promise<any>;
  onDeleteComentario?: (comentarioId: string) => Promise<any>;
  currentUserId?: string | null;
  statusOcorrencia?: StatusOcorrencia;
  isLoading?: boolean;
}

export function ComentariosThread({
  comentarios,
  onAddComentario,
  onDeleteComentario,
  currentUserId,
  statusOcorrencia,
  isLoading,
}: ComentariosThreadProps) {
  const [novoComentario, setNovoComentario] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para modal de exclusão de comentário
  const [comentarioParaExcluir, setComentarioParaExcluir] =
    useState<Comentario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isOcorrenciaAberta =
    statusOcorrencia !== "Resolvida" && statusOcorrencia !== "Cancelada";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const conteudoTrimmed = novoComentario.trim();
    if (!conteudoTrimmed || conteudoTrimmed.length < 2) {
      setError("O comentário deve ter no mínimo 2 caracteres.");
      return;
    }

    if (conteudoTrimmed.length > 1000) {
      setError("O comentário não pode exceder 1.000 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddComentario(conteudoTrimmed);
      setNovoComentario("");
    } catch (err: any) {
      setError(err.message || "Erro ao enviar comentário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!comentarioParaExcluir || !onDeleteComentario) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await onDeleteComentario(comentarioParaExcluir.id);
      setComentarioParaExcluir(null);
    } catch (err: any) {
      setDeleteError(err.message || "Erro ao excluir comentário.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-[#EDF2F7] pb-3">
        <MessageSquare className="w-5 h-5 text-[#0F4C81]" />
        <h3 className="font-heading text-lg font-semibold text-[#181C1E]">
          Comentários e Histórico ({comentarios.length})
        </h3>
      </div>

      {/* Lista de Comentários */}
      {isLoading ? (
        <div className="p-6 text-center text-sm text-[#545F72]">
          Carregando mensagens...
        </div>
      ) : comentarios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#CBD5E1] p-6 text-center text-xs text-[#545F72]">
          Nenhum comentário adicionado ainda. Deixe um apontamento ou
          esclarecimento abaixo.
        </div>
      ) : (
        <div className="space-y-3">
          {comentarios.map((comentario) => {
            const isOfficial = comentario.autor_tipo === "funcionario";
            const isDeleted = Boolean(comentario.deleted_at);
            const isAuthor =
              Boolean(currentUserId) && comentario.morador_id === currentUserId;
            const canDelete = isAuthor && !isDeleted && isOcorrenciaAberta;

            if (isDeleted) {
              return (
                <div
                  key={comentario.id}
                  className="p-4 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] transition-colors opacity-80"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-[#E2E8F0] text-[#94A3B8]">
                        <User className="w-4 h-4" />
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-xs text-[#64748B]">
                          {comentario.nome_autor}
                        </span>
                        {comentario.unidade_autor && (
                          <span className="text-[11px] text-[#94A3B8]">
                            ({comentario.unidade_autor})
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] text-[#94A3B8] shrink-0">
                      {formatarData(comentario.created_at)}
                    </span>
                  </div>

                  <p className="text-sm italic text-[#64748B] leading-relaxed pl-9">
                    Este comentário foi removido pelo autor.
                  </p>
                </div>
              );
            }

            return (
              <div
                key={comentario.id}
                className={cn(
                  "p-4 rounded-xl border transition-colors",
                  isOfficial
                    ? "bg-[#0F4C81]/5 border-[#0F4C81]/20"
                    : "bg-white border-[#EDF2F7] shadow-2xs"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                        isOfficial
                          ? "bg-[#00355F] text-white"
                          : "bg-[#F1F4F6] text-[#545F72]"
                      )}
                    >
                      {isOfficial ? (
                        <ShieldCheck className="w-4 h-4 text-sky-300" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-[#181C1E]">
                          {comentario.nome_autor}
                        </span>
                        {isOfficial ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#00355F] text-white">
                            Resposta Oficial
                          </span>
                        ) : (
                          comentario.unidade_autor && (
                            <span className="text-[11px] text-[#545F72]">
                              ({comentario.unidade_autor})
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#94A3B8]">
                      {formatarData(comentario.created_at)}
                    </span>

                    {/* Botão de Exclusão exclusivo do autor em ocorrência aberta */}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError(null);
                          setComentarioParaExcluir(comentario);
                        }}
                        title="Excluir este comentário"
                        className="text-[#94A3B8] hover:text-[#BA1A1A] hover:bg-rose-50 p-1 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Excluir comentário</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-[#181C1E] leading-relaxed pl-9 whitespace-pre-wrap">
                  {comentario.conteudo}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Formulário para Adicionar Comentário */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-2">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <Textarea
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder="Escreva um comentário sobre o andamento desta ocorrência..."
            rows={3}
            maxLength={1000}
            disabled={isSubmitting}
            className="text-sm"
          />
          <div className="flex justify-between items-center text-[11px] text-[#94A3B8] px-1">
            <span>
              Apenas texto puro. Não é permitido envio de fotos em comentários.
            </span>
            <span>{novoComentario.length}/1000</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !novoComentario.trim()}
            className="gap-2 font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Comentário
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Diálogo Modal de Confirmação de Exclusão */}
      <Dialog
        open={Boolean(comentarioParaExcluir)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setComentarioParaExcluir(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Excluir comentário</DialogTitle>
          <DialogDescription>
            Tem certeza de que deseja excluir este comentário? O texto original
            será removido permanentemente e esta ação não poderá ser desfeita.
          </DialogDescription>
        </DialogHeader>

        {deleteError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {deleteError}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setComentarioParaExcluir(null);
              setDeleteError(null);
            }}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Excluir Comentário
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

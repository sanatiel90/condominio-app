"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusOcorrencia } from "@/types/database.types";
import { STATUS_OCORRENCIA } from "@/lib/validations/ocorrencia.schema";
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  MessageSquareQuote,
} from "lucide-react";

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statusAtual: StatusOcorrencia;
  onConfirm: (
    novoStatus: StatusOcorrencia,
    observacao: string
  ) => Promise<void>;
  isLoading?: boolean;
}

export function StatusUpdateDialog({
  open,
  onOpenChange,
  statusAtual,
  onConfirm,
  isLoading,
}: StatusUpdateDialogProps) {
  const [novoStatus, setNovoStatus] = useState<StatusOcorrencia>(statusAtual);
  const [observacao, setObservacao] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNovoStatus(statusAtual);
      setObservacao("");
      setError(null);
    } else {
      setObservacao("");
      setError(null);
    }
  }, [statusAtual, open]);

  const handleClose = () => {
    setObservacao("");
    setError(null);
    onOpenChange(false);
  };

  const getPlaceholder = () => {
    switch (novoStatus) {
      case "Resolvida":
        return "Descreva como o problema foi solucionado (ex.: Vazamento consertado pelo encanador predial e o local foi seco e higienizado)...";
      case "Cancelada":
        return "Informe o motivo do cancelamento (ex.: Solicitação duplicada com a ocorrência #OC-1020)...";
      case "Em Andamento":
        return "Explique o andamento (ex.: Técnico da assistência acionado, visita agendada para hoje às 14h)...";
      case "Em Análise":
        return "Explique a triagem (ex.: Chamado encaminhado para orçamento com fornecedores credenciados)...";
      default:
        return "Descreva o parecer administrativo para esta atualização...";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const obsTrimmed = observacao.trim();
    if (!obsTrimmed || obsTrimmed.length < 5) {
      setError(
        "Por favor, informe um comentário explicando a alteração ou conclusão deste status (mínimo de 5 caracteres)."
      );
      return;
    }

    try {
      await onConfirm(novoStatus, obsTrimmed);
      setObservacao("");
      setError(null);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar status da ocorrência.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader>
        <DialogTitle>Gerenciar Status da Ocorrência</DialogTitle>
        <DialogDescription>
          Apenas funcionários e administradores podem alterar o ciclo de
          atendimento deste chamado.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
            {error}
          </div>
        )}

        {/* Status Atual e Novo Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-[#F7FAFC] border border-[#EDF2F7]">
          <div>
            <span className="text-[11px] font-semibold text-[#545F72] block mb-1">
              Status Atual:
            </span>
            <StatusBadge status={statusAtual} />
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#545F72] block mb-1">
              Novo Status Pretendido:
            </span>
            <StatusBadge status={novoStatus} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#545F72]">
            Selecione o Novo Status *
          </label>
          <select
            value={novoStatus}
            onChange={(e) => setNovoStatus(e.target.value as StatusOcorrencia)}
            disabled={isLoading}
            className="flex h-11 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#181C1E] focus:outline-hidden focus:border-[#0F4C81]"
          >
            {STATUS_OCORRENCIA.map((st) => (
              <option key={st} value={st}>
                {st} {st === "Resolvida" ? "✓ (Concluir / Fechar chamado)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Alerta contextual se for Resolvida ou Cancelada */}
        {novoStatus === "Resolvida" && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>
              Você está marcando este chamado como{" "}
              <strong>Resolvido / Concluído</strong>. O comentário abaixo ficará
              visível publicamente a todos os moradores como a conclusão oficial
              do problema.
            </span>
          </div>
        )}

        {novoStatus === "Cancelada" && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>
              Você está marcando este chamado como <strong>Cancelado</strong>.
              Informe obrigatoriamente a justificativa para o morador.
            </span>
          </div>
        )}

        {/* Campo Obrigatório de Comentário */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#545F72] flex items-center gap-1">
              <MessageSquareQuote className="w-3.5 h-3.5 text-[#0F4C81]" />
              Comentário de Conclusão / Andamento do Status *
            </label>
            <span className="text-[10px] text-[#94A3B8]">Obrigatório</span>
          </div>
          <Textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder={getPlaceholder()}
            rows={4}
            disabled={isLoading}
            className="text-xs leading-relaxed"
            autoFocus
            required
          />
          <p className="text-[11px] text-[#545F72] leading-tight">
            Este comentário será registrado na linha do tempo pública como uma{" "}
            <strong>Resposta Oficial da Administração</strong>.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              isLoading || !observacao.trim() || observacao.trim().length < 5
            }
            className="bg-[#00355F] hover:bg-[#0F4C81]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                Gravando...
              </>
            ) : (
              "Confirmar e Publicar Parecer"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusOcorrencia } from "@/types/database.types";
import { STATUS_OCORRENCIA } from "@/lib/validations/ocorrencia.schema";
import { Loader2 } from "lucide-react";

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statusAtual: StatusOcorrencia;
  onConfirm: (novoStatus: StatusOcorrencia, observacao?: string) => Promise<void>;
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

  React.useEffect(() => {
    setNovoStatus(statusAtual);
    setObservacao("");
    setError(null);
  }, [statusAtual, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onConfirm(novoStatus, observacao.trim() || undefined);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar status.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Gerenciar Status da Ocorrência</DialogTitle>
        <DialogDescription>
          Apenas funcionários autorizados podem alterar o ciclo de atendimento deste chamado.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#545F72]">
            Novo Status do Chamado
          </label>
          <select
            value={novoStatus}
            onChange={(e) => setNovoStatus(e.target.value as StatusOcorrencia)}
            disabled={isLoading}
            className="flex h-11 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#181C1E] focus:outline-hidden focus:border-[#0F4C81]"
          >
            {STATUS_OCORRENCIA.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#545F72]">
            Observação / Justificativa (Opcional)
          </label>
          <Textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Ex.: Técnico da empresa terceirizada acionado para vistoria hoje à tarde..."
            rows={3}
            disabled={isLoading}
            className="text-xs"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                Atualizando...
              </>
            ) : (
              "Confirmar Alteração"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}


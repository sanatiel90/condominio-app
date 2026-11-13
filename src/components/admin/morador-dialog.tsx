"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Morador } from "@/types/database.types";
import { MoradorFormInput } from "@/lib/validations/morador.schema";
import { Loader2 } from "lucide-react";

interface MoradorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moradorParaEditar?: Morador | null;
  onSubmit: (data: MoradorFormInput) => Promise<void>;
  isLoading?: boolean;
}

export function MoradorDialog({
  open,
  onOpenChange,
  moradorParaEditar,
  onSubmit,
  isLoading,
}: MoradorDialogProps) {
  const [formData, setFormData] = useState<MoradorFormInput>({
    nome: "",
    email: "",
    torre: "",
    apartamento: "",
    telefone: "",
    status: "ativo",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (moradorParaEditar) {
      setFormData({
        nome: moradorParaEditar.nome,
        email: moradorParaEditar.email,
        torre: moradorParaEditar.torre,
        apartamento: moradorParaEditar.apartamento,
        telefone: moradorParaEditar.telefone,
        status: moradorParaEditar.status,
      });
    } else {
      setFormData({
        nome: "",
        email: "",
        torre: "",
        apartamento: "",
        telefone: "",
        status: "ativo",
      });
    }
    setError(null);
  }, [moradorParaEditar, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nome.trim() || formData.nome.trim().length < 3) {
      setError("O nome completo deve conter pelo menos 3 caracteres.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (!formData.torre.trim()) {
      setError("A torre ou bloco é obrigatória.");
      return;
    }
    if (!formData.apartamento.trim()) {
      setError("O número do apartamento é obrigatório.");
      return;
    }
    if (!formData.telefone.trim()) {
      setError("Informe um telefone de contato.");
      return;
    }

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar dados do morador.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>
          {moradorParaEditar ? "Editar Morador" : "Cadastrar Novo Morador"}
        </DialogTitle>
        <DialogDescription>
          {moradorParaEditar
            ? "Atualize as informações cadastrais e de acesso do morador."
            : "Preencha os dados do morador para autorizar seu acesso imediato ao sistema sem necessidade de senha."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#545F72]">
            Nome Completo *
          </label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex.: Mariana Silva"
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#545F72]">
            E-mail de Acesso *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="mariana@exemplo.com"
            disabled={isLoading}
            required
          />
          <p className="text-[11px] text-[#94A3B8]">
            Este é o e-mail que o morador usará para entrar no portal.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#545F72]">
              Torre / Bloco *
            </label>
            <Input
              value={formData.torre}
              onChange={(e) => setFormData({ ...formData, torre: e.target.value })}
              placeholder="Ex.: Torre A"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#545F72]">
              Apartamento *
            </label>
            <Input
              value={formData.apartamento}
              onChange={(e) => setFormData({ ...formData, apartamento: e.target.value })}
              placeholder="Ex.: 402"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#545F72]">
            Telefone / WhatsApp *
          </label>
          <Input
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            placeholder="(11) 98765-4321"
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#545F72]">
            Status do Cadastro
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as "ativo" | "inativo",
              })
            }
            disabled={isLoading}
            className="flex h-11 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#181C1E] focus:outline-hidden focus:border-[#0F4C81]"
          >
            <option value="ativo">Ativo (Acesso Liberado)</option>
            <option value="inativo">Inativo (Acesso Bloqueado)</option>
          </select>
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
                Salvando...
              </>
            ) : moradorParaEditar ? (
              "Salvar Alterações"
            ) : (
              "Cadastrar Morador"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}


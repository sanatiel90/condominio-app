"use client";

import React, { useState } from "react";
import { Users, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoradoresTable } from "@/components/admin/moradores-table";
import { MoradorDialog } from "@/components/admin/morador-dialog";
import { useMoradores } from "@/hooks/use-moradores";
import { Morador } from "@/types/database.types";
import { MoradorFormInput } from "@/lib/validations/morador.schema";

export default function MoradoresAdminPage() {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [moradorParaEditar, setMoradorParaEditar] = useState<Morador | null>(null);

  const { moradores, isLoading, createMorador, updateMorador } = useMoradores({
    busca,
    status: statusFiltro,
  });

  const handleOpenNovo = () => {
    setMoradorParaEditar(null);
    setDialogAberto(true);
  };

  const handleOpenEditar = (morador: Morador) => {
    setMoradorParaEditar(morador);
    setDialogAberto(true);
  };

  const handleToggleStatus = async (morador: Morador) => {
    const novoStatus = morador.status === "ativo" ? "inativo" : "ativo";
    await updateMorador.mutateAsync({
      id: morador.id,
      data: { status: novoStatus },
    });
  };

  const handleSubmitMorador = async (data: MoradorFormInput) => {
    if (moradorParaEditar) {
      await updateMorador.mutateAsync({
        id: moradorParaEditar.id,
        data,
      });
    } else {
      await createMorador.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#181C1E]">
            Cadastro e Gestão de Moradores
          </h1>
          <p className="text-sm text-[#545F72] mt-0.5">
            Gerencie os residentes autorizados a acessar o portal sem senha e abrir ocorrências.
          </p>
        </div>

        <Button onClick={handleOpenNovo} className="shrink-0 gap-2 font-medium">
          <UserPlus className="w-4 h-4" />
          Novo Morador
        </Button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-[#EDF2F7] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, apartamento, torre ou e-mail..."
            className="pl-10 h-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="h-10 px-3 text-xs rounded-lg border border-[#E2E8F0] bg-white text-[#181C1E] focus:outline-hidden focus:border-[#0F4C81] w-full sm:w-auto"
          >
            <option value="">Todos os Status</option>
            <option value="ativo">Apenas Ativos</option>
            <option value="inativo">Apenas Inativos</option>
          </select>
        </div>
      </div>

      {/* Tabela de Moradores */}
      <MoradoresTable
        moradores={moradores}
        onEdit={handleOpenEditar}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />

      {/* Modal de Criação / Edição */}
      <MoradorDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        moradorParaEditar={moradorParaEditar}
        onSubmit={handleSubmitMorador}
        isLoading={createMorador.isPending || updateMorador.isPending}
      />
    </div>
  );
}


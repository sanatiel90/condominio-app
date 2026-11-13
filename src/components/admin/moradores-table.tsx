"use client";

import React from "react";
import { Morador } from "@/types/database.types";
import { Edit2, UserCheck, UserX, Search, Phone, Mail, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MoradoresTableProps {
  moradores: Morador[];
  onEdit: (morador: Morador) => void;
  onToggleStatus: (morador: Morador) => void;
  isLoading?: boolean;
}

export function MoradoresTable({
  moradores,
  onEdit,
  onToggleStatus,
  isLoading,
}: MoradoresTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#EDF2F7] p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0F4C81] border-t-transparent" />
        <p className="mt-3 text-sm text-[#545F72]">Carregando lista de moradores...</p>
      </div>
    );
  }

  if (moradores.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#EDF2F7] p-12 text-center">
        <p className="text-base font-semibold text-[#181C1E] mb-1 font-heading">
          Nenhum morador encontrado
        </p>
        <p className="text-sm text-[#545F72] max-w-sm mx-auto">
          Não há registros correspondentes aos filtros selecionados ou ainda não há moradores cadastrados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#EDF2F7] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#EDF2F7] bg-[#F7FAFC] text-[11px] font-bold uppercase tracking-wider text-[#545F72]">
              <th className="py-3 px-5">Morador</th>
              <th className="py-3 px-5">Unidade</th>
              <th className="py-3 px-5">Contato</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDF2F7] text-sm text-[#181C1E]">
            {moradores.map((morador) => (
              <tr
                key={morador.id}
                className="hover:bg-[#F7FAFC]/80 transition-colors"
              >
                {/* Nome e E-mail */}
                <td className="py-3.5 px-5">
                  <div className="font-semibold text-[#181C1E]">{morador.nome}</div>
                  <div className="text-xs text-[#545F72] flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-[#94A3B8]" />
                    {morador.email}
                  </div>
                </td>

                {/* Torre e Apartamento */}
                <td className="py-3.5 px-5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F1F4F6] text-xs font-medium text-[#181C1E]">
                    <Home className="w-3.5 h-3.5 text-[#0F4C81]" />
                    {morador.torre} · Apto {morador.apartamento}
                  </div>
                </td>

                {/* Telefone */}
                <td className="py-3.5 px-5 text-xs text-[#545F72]">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
                    {morador.telefone}
                  </div>
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                      morador.status === "ativo"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        morador.status === "ativo"
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      )}
                    />
                    {morador.status === "ativo" ? "Ativo" : "Inativo"}
                  </span>
                </td>

                {/* Ações */}
                <td className="py-3.5 px-5 text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(morador)}
                    className="h-8 px-2.5 text-xs font-medium text-[#0F4C81] hover:bg-[#F1F4F6]"
                    title="Editar informações"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Editar
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStatus(morador)}
                    className={cn(
                      "h-8 px-2.5 text-xs font-medium",
                      morador.status === "ativo"
                        ? "text-rose-700 hover:bg-rose-50"
                        : "text-emerald-700 hover:bg-emerald-50"
                    )}
                    title={
                      morador.status === "ativo"
                        ? "Inativar morador (bloqueia o login)"
                        : "Ativar morador (libera o login)"
                    }
                  >
                    {morador.status === "ativo" ? (
                      <>
                        <UserX className="w-3.5 h-3.5 mr-1" />
                        Inativar
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                        Ativar
                      </>
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="py-3 px-5 bg-[#F7FAFC] border-t border-[#EDF2F7] text-xs text-[#545F72] flex justify-between items-center">
        <span>Total de {moradores.length} morador(es) listado(s)</span>
      </div>
    </div>
  );
}


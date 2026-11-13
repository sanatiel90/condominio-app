"use client";

import React from "react";
import { Search, Bell, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/hooks/use-session";

export function AdminTopbar() {
  const { user } = useSession();

  return (
    <header className="h-16 border-b border-[#EDF2F7] bg-white px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar ocorrência, ID, morador..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-[#181C1E] placeholder:text-[#94A3B8] focus:bg-white focus:outline-hidden focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/ocorrencias"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0F4C81] hover:bg-[#F1F4F6] rounded-md transition-colors"
          title="Ver o mural de ocorrências como morador"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver Mural Público
        </Link>

        <button
          type="button"
          className="relative p-2 text-[#545F72] hover:text-[#181C1E] hover:bg-[#F1F4F6] rounded-lg transition-colors"
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0F4C81]" />
        </button>

        <div className="h-4 w-px bg-[#E2E8F0] mx-1" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#00355F] text-white flex items-center justify-center font-bold text-xs">
            {user?.nome ? user.nome.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-semibold text-[#181C1E]">
              {user?.nome || "Equipe Operacional"}
            </span>
            <span className="block text-[10px] text-[#545F72]">
              Administração
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}


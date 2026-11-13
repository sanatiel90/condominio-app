"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, PlusCircle, LogOut, Shield } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

export function CondominioHeader() {
  const pathname = usePathname();
  const { user, isFuncionario, logout, isLoggingOut } = useSession();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#EDF2F7] shadow-2xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/ocorrencias" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00355F] text-white flex items-center justify-center shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading font-bold text-base tracking-tight text-[#181C1E] block leading-tight">
              CondoManager
            </span>
            <span className="text-[11px] font-medium text-[#545F72] block leading-tight">
              Residencial Aurora
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {isFuncionario && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#00355F] bg-[#0F4C81]/10 rounded-lg hover:bg-[#0F4C81]/20 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Painel Admin
            </Link>
          )}

          <Link
            href="/nova-ocorrencia"
            className={cn(
              "inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg text-xs font-semibold shadow-xs transition-colors",
              pathname === "/nova-ocorrencia"
                ? "bg-[#0F4C81] text-white"
                : "bg-[#00355F] text-white hover:bg-[#0F4C81]"
            )}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden xs:inline">Nova Ocorrência</span>
            <span className="xs:hidden">Nova</span>
          </Link>

          <div className="h-4 w-px bg-[#E2E8F0] mx-0.5 sm:mx-1" />

          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right">
              <span className="block text-xs font-semibold text-[#181C1E] truncate max-w-[140px]">
                {user?.nome || "Morador"}
              </span>
              <span className="block text-[10px] text-[#545F72] truncate max-w-[140px]">
                {user?.role === "morador"
                  ? `${user.torre} · Apto ${user.apartamento}`
                  : "Administração"}
              </span>
            </div>

            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="p-2 text-[#545F72] hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Sair do sistema"
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  PlusCircle, 
  LogOut, 
  Shield 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout, isLoggingOut, user } = useSession();

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Ocorrências",
      href: "/admin/ocorrencias",
      icon: ClipboardList,
      active: pathname.startsWith("/admin/ocorrencias"),
    },
    {
      label: "Cadastro de Moradores",
      href: "/admin/moradores",
      icon: Users,
      active: pathname.startsWith("/admin/moradores"),
    },
  ];

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-[#EDF2F7] flex flex-col justify-between min-h-screen sticky top-0 h-screen z-30">
      <div>
        {/* Identificação da Marca */}
        <div className="p-5 border-b border-[#EDF2F7]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00355F] text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-base tracking-tight text-[#181C1E] block leading-tight">
                CondoManager
              </span>
              <span className="text-[11px] font-medium text-[#545F72] block leading-tight">
                Residencial Aurora · Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Botão de Destaque "+ Nova Ocorrência" */}
        <div className="p-4">
          <Link
            href="/nova-ocorrencia"
            className="flex items-center justify-center gap-2 w-full h-11 px-4 rounded-lg bg-[#00355F] text-white text-sm font-semibold hover:bg-[#0F4C81] transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Ocorrência
          </Link>
        </div>

        {/* Menu de Navegação */}
        <nav className="px-3 py-2 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Gestão Predial
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  item.active
                    ? "bg-[#0F4C81]/10 text-[#00355F] font-semibold"
                    : "text-[#545F72] hover:bg-[#F1F4F6] hover:text-[#181C1E]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    item.active ? "text-[#00355F]" : "text-[#545F72]"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Rodapé com Informações do Usuário e Sair */}
      <div className="p-4 border-t border-[#EDF2F7] space-y-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-[#0F4C81]/10 text-[#00355F] flex items-center justify-center font-bold text-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div className="truncate flex-1">
            <span className="block text-xs font-semibold text-[#181C1E] truncate">
              {user?.nome || "Administração"}
            </span>
            <span className="block text-[11px] text-[#545F72] truncate">
              {user?.email || "aurora.admin@condo.com"}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          {isLoggingOut ? "Saindo..." : "Encerrar Sessão"}
        </button>
      </div>
    </aside>
  );
}


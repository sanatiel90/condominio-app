import React, { Suspense } from "react";
import { CondominioHeader } from "@/components/shared/condominio-header";

export default function CondominioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFC]">
      <Suspense fallback={
        <div className="h-16 bg-white border-b border-[#EDF2F7] animate-pulse" />
      }>
        <CondominioHeader />
      </Suspense>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Suspense fallback={
          <div className="py-12 text-center text-sm text-[#545F72]">
            Carregando conteúdo...
          </div>
        }>
          {children}
        </Suspense>
      </main>

      <footer className="border-t border-[#EDF2F7] bg-white py-6 text-center text-xs text-[#545F72]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Residencial Aurora · Gestão de Ocorrências e Convivência</span>
          <span>© 2026 CondoManager</span>
        </div>
      </footer>
    </div>
  );
}

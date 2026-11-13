import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OcorrenciaForm } from "@/components/ocorrencias/ocorrencia-form";

export const metadata = {
  title: "Nova Ocorrência — CondoManager",
  description: "Formulário para registrar uma nova solicitação ou problema no condomínio.",
};

export default function NovaOcorrenciaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/ocorrencias"
          className="p-2 rounded-lg border border-[#E2E8F0] bg-white text-[#545F72] hover:text-[#181C1E] hover:bg-[#F1F4F6] transition-colors"
          title="Voltar ao mural"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#181C1E]">
            Registrar Ocorrência
          </h1>
          <p className="text-sm text-[#545F72]">
            Comunique um problema à administração para acompanhamento de toda a comunidade.
          </p>
        </div>
      </div>

      <OcorrenciaForm />
    </div>
  );
}


import Link from "next/link";
import { 
  Building2, 
  ArrowRight, 
  Users, 
  Shield, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles, 
  Camera 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFC]">
      {/* Header */}
      <header className="border-b border-[#EDF2F7] bg-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
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
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-[#545F72] hover:text-[#00355F] px-3 py-2 rounded-lg transition-colors"
            >
              Área Administrativa
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-[#00355F] text-white hover:bg-[#0F4C81] transition-colors shadow-xs"
            >
              Portal do Morador
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F4C81]/10 text-[#00355F] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Comunicação Transparente e Convivência Harmoniosa
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-[#181C1E] leading-tight">
            Sistema de Ocorrências do Residencial Aurora
          </h1>
          <p className="text-base text-[#545F72] mt-4 leading-relaxed">
            Reporte problemas, anexe fotos e acompanhe a resolução em tempo real.
            Sem necessidade de decorar senhas para os moradores.
          </p>
        </div>

        {/* Portais de Acesso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
          {/* Card Morador */}
          <div className="rounded-2xl border border-[#EDF2F7] bg-white p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0F4C81] flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="font-heading text-xl font-bold text-[#181C1E] mb-2">
                Sou Morador
              </h2>
              <p className="text-sm text-[#545F72] leading-relaxed mb-6">
                Acesse o mural de ocorrências do condomínio e abra novos chamados informando apenas o seu e-mail cadastrado.
              </p>

              <ul className="space-y-2 text-xs text-[#545F72] mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Acesso sem senha via e-mail pré-cadastrado
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Registro de chamados com foto comprobatória
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Mural comunitário e histórico de comentários
                </li>
              </ul>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-[#00355F] text-white text-sm font-semibold hover:bg-[#0F4C81] transition-all shadow-xs w-full"
            >
              Acessar como Morador
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card Funcionário */}
          <div className="rounded-2xl border border-[#EDF2F7] bg-white p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#00355F] flex items-center justify-center mb-5">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="font-heading text-xl font-bold text-[#181C1E] mb-2">
                Equipe & Administração
              </h2>
              <p className="text-sm text-[#545F72] leading-relaxed mb-6">
                Área restrita para síndicos, zeladores e gerência predial gerenciarem moradores e o ciclo de vida dos chamados.
              </p>

              <ul className="space-y-2 text-xs text-[#545F72] mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00355F] shrink-0" />
                  Dashboard completo com KPIs e métricas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00355F] shrink-0" />
                  Controle de status (Em Análise, Andamento, Resolvida)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00355F] shrink-0" />
                  Cadastro, edição e ativação de moradores
                </li>
              </ul>
            </div>

            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-[#F1F4F6] text-[#181C1E] text-sm font-semibold hover:bg-[#E2E8F0] border border-[#E2E8F0] transition-all w-full"
            >
              Acesso Administrativo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EDF2F7] bg-white py-6 text-center text-xs text-[#545F72]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Residencial Aurora · Gestão de Ocorrências</span>
          <span>Desenvolvido com Next.js 16 + React 19 + Supabase</span>
        </div>
      </footer>
    </div>
  );
}

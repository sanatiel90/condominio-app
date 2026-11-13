"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, ArrowRight, ShieldCheck, Mail, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function MoradorLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setErrorMessage("Por favor, digite seu e-mail.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/morador-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Não foi possível validar o e-mail.");
        return;
      }

      toast.success(`Bem-vindo(a), ${data.morador.nome}!`);
      const from = searchParams.get("from");
      router.push(from || "/ocorrencias");
      router.refresh();
    } catch {
      setErrorMessage("Erro de rede. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-[#EDF2F7] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl">Acesso do Morador</CardTitle>
        <CardDescription>
          Informe seu e-mail cadastrado para acessar o mural e abrir chamados.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-[#545F72]"
            >
              E-mail do Morador
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="pl-10"
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Validando cadastro...
              </>
            ) : (
              <>
                Entrar no Condomínio
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-5 p-3 rounded-lg bg-[#F1F4F6] border border-[#E2E8F0] flex items-start gap-2 text-xs text-[#545F72]">
          <ShieldCheck className="w-4 h-4 text-[#0F4C81] shrink-0 mt-0.5" />
          <span>
            <strong>Acesso sem senha:</strong> Para sua comodidade, o acesso é
            autorizado unicamente pelo e-mail previamente cadastrado pela
            administração do condomínio.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MoradorLoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#F7FAFC]">
      <div className="w-full max-w-md">
        {/* Logo e Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00355F] text-white shadow-md mb-3">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#181C1E]">
            CondoManager
          </h1>
          <p className="text-sm text-[#545F72] mt-1">
            Residencial Aurora · Portal Comunitário de Ocorrências
          </p>
        </div>

        {/* Card de Login dentro de Suspense */}
        <Suspense fallback={
          <div className="bg-white rounded-xl border border-[#EDF2F7] p-8 text-center text-sm text-[#545F72]">
            Carregando acesso...
          </div>
        }>
          <MoradorLoginForm />
        </Suspense>

        {/* Rodapé e Link para Administração */}
        <div className="mt-6 text-center">
          <Link
            href="/admin/login"
            className="text-xs font-medium text-[#545F72] hover:text-[#00355F] transition-colors inline-flex items-center gap-1"
          >
            É funcionário da administração? <span className="underline font-semibold text-[#0F4C81]">Acesse o painel restrito</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

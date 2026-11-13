"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Preencha seu e-mail e sua senha de acesso.");
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(
          error.message === "Invalid login credentials"
            ? "Credenciais inválidas. Verifique seu e-mail e senha institucional."
            : error.message
        );
        return;
      }

      toast.success("Login administrativo efetuado com sucesso.");
      router.push("/admin");
      router.refresh();
    } catch {
      setErrorMessage("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#F7FAFC]">
      <div className="w-full max-w-md">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00355F] text-white shadow-md mb-3">
            <Shield className="w-8 h-8 text-sky-300" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#181C1E]">
            Painel Administrativo
          </h1>
          <p className="text-sm text-[#545F72] mt-1">
            Residencial Aurora · Síndico e Equipe Operacional
          </p>
        </div>

        {/* Card de Login */}
        <Card className="border border-[#EDF2F7] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Acesso Corporativo</CardTitle>
            <CardDescription>
              Insira suas credenciais institucionais para gerenciar o condomínio.
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
                  htmlFor="admin-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#545F72]"
                >
                  E-mail Funcional
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="funcionario@aurora.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="pl-10"
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#545F72]"
                >
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full font-medium mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    Acessar Dashboard
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Rodapé e Link de Voltar */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-xs font-medium text-[#545F72] hover:text-[#00355F] transition-colors inline-flex items-center gap-1"
          >
            ← Voltar para o portal do morador
          </Link>
        </div>
      </div>
    </div>
  );
}


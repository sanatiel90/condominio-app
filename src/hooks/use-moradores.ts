"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Morador } from "@/types/database.types";
import { MoradorFormInput } from "@/lib/validations/morador.schema";
import { toast } from "sonner";

interface UseMoradoresOptions {
  busca?: string;
  status?: string;
}

export function useMoradores(options: UseMoradoresOptions = {}) {
  const queryClient = useQueryClient();
  const { busca = "", status = "" } = options;

  const { data, isLoading, error, refetch } = useQuery<{ moradores: Morador[] }>({
    queryKey: ["moradores", { busca, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      if (status) params.set("status", status);

      const res = await fetch(`/api/moradores?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao carregar moradores.");
      }
      return res.json();
    },
  });

  const createMorador = useMutation({
    mutationFn: async (input: MoradorFormInput) => {
      const res = await fetch("/api/moradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao cadastrar morador.");
      return data.morador;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moradores"] });
      toast.success("Morador cadastrado com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateMorador = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<MoradorFormInput>;
    }) => {
      const res = await fetch(`/api/moradores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Erro ao atualizar morador.");
      return resData.morador;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moradores"] });
      toast.success("Dados do morador atualizados com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    moradores: data?.moradores || [],
    isLoading,
    error,
    refetch,
    createMorador,
    updateMorador,
  };
}


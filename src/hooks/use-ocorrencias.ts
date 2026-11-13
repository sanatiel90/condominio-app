"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ocorrencia, Comentario, StatusOcorrencia } from "@/types/database.types";
import { OcorrenciaFormInput } from "@/lib/validations/ocorrencia.schema";
import { toast } from "sonner";

interface UseOcorrenciasOptions {
  categoria?: string;
  status?: string;
  busca?: string;
}

export function useOcorrencias(options: UseOcorrenciasOptions = {}) {
  const queryClient = useQueryClient();
  const { categoria = "", status = "", busca = "" } = options;

  const { data, isLoading, error, refetch } = useQuery<{ ocorrencias: Ocorrencia[] }>({
    queryKey: ["ocorrencias", { categoria, status, busca }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoria) params.set("categoria", categoria);
      if (status) params.set("status", status);
      if (busca) params.set("busca", busca);

      const res = await fetch(`/api/ocorrencias?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao carregar mural de ocorrências.");
      }
      return res.json();
    },
  });

  const createOcorrencia = useMutation({
    mutationFn: async (input: OcorrenciaFormInput) => {
      const res = await fetch("/api/ocorrencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Erro ao registrar ocorrência.");
      return resData.ocorrencia;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ocorrencias"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metricas"] });
      toast.success("Ocorrência registrada com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    ocorrencias: data?.ocorrencias || [],
    isLoading,
    error,
    refetch,
    createOcorrencia,
  };
}

export function useOcorrenciaDetalhe(id: string) {
  const queryClient = useQueryClient();

  const ocorrenciaQuery = useQuery<{ ocorrencia: Ocorrencia }>({
    queryKey: ["ocorrencia", id],
    queryFn: async () => {
      const res = await fetch(`/api/ocorrencias/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao carregar ocorrência.");
      }
      return res.json();
    },
    enabled: Boolean(id),
  });

  const comentariosQuery = useQuery<{ comentarios: Comentario[] }>({
    queryKey: ["comentarios", id],
    queryFn: async () => {
      const res = await fetch(`/api/ocorrencias/${id}/comentarios`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao carregar comentários.");
      }
      return res.json();
    },
    enabled: Boolean(id),
  });

  const addComentario = useMutation({
    mutationFn: async (conteudo: string) => {
      const res = await fetch(`/api/ocorrencias/${id}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Erro ao enviar comentário.");
      return resData.comentario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comentarios", id] });
      queryClient.invalidateQueries({ queryKey: ["ocorrencia", id] });
      toast.success("Comentário adicionado.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      status,
      observacao,
    }: {
      status: StatusOcorrencia;
      observacao?: string;
    }) => {
      const res = await fetch(`/api/ocorrencias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, observacao }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Erro ao atualizar status.");
      return resData.ocorrencia;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ocorrencia", id] });
      queryClient.invalidateQueries({ queryKey: ["ocorrencias"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metricas"] });
      toast.success(`Status atualizado para "${data.status}".`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    ocorrencia: ocorrenciaQuery.data?.ocorrencia || null,
    isLoadingOcorrencia: ocorrenciaQuery.isLoading,
    errorOcorrencia: ocorrenciaQuery.error,
    comentarios: comentariosQuery.data?.comentarios || [],
    isLoadingComentarios: comentariosQuery.isLoading,
    addComentario,
    updateStatus,
  };
}

export function useAdminMetricas() {
  return useQuery<{
    total: number;
    pendentes: number;
    emAndamento: number;
    resolvidas: number;
  }>({
    queryKey: ["admin-metricas"],
    queryFn: async () => {
      const res = await fetch("/api/admin/metricas");
      if (!res.ok) return { total: 0, pendentes: 0, emAndamento: 0, resolvidas: 0 };
      return res.json();
    },
  });
}


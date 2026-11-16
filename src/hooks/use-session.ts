"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CurrentSession } from "@/types/database.types";
import { toast } from "sonner";

export function useSession() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery<{
    user: CurrentSession | null;
  }>({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      if (!res.ok) return { user: null };
      return res.json();
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.setQueryData(["session"], { user: null });
      queryClient.clear();
      toast.success("Sessão encerrada com sucesso.");
      router.push("/login");
      router.refresh();
    },
  });

  return {
    user: data?.user || null,
    isMorador: data?.user?.role === "morador",
    isFuncionario: data?.user?.role === "funcionario",
    isLoading,
    error,
    refetch,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}

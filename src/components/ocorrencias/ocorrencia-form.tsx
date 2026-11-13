"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  UploadCloud, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  FileText, 
  Tag 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CATEGORIAS_OCORRENCIA, 
  OcorrenciaFormInput 
} from "@/lib/validations/ocorrencia.schema";
import { useOcorrencias } from "@/hooks/use-ocorrencias";
import { toast } from "sonner";

export function OcorrenciaForm() {
  const router = useRouter();
  const { createOcorrencia } = useOcorrencias();

  const [formData, setFormData] = useState<OcorrenciaFormInput>({
    titulo: "",
    categoria: "Manutenção",
    local: "",
    descricao: "",
    foto_url: null,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A foto deve ter no máximo 5MB.");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Formato inválido. Use JPEG, PNG ou WEBP.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validações locais
    if (!formData.titulo.trim() || formData.titulo.trim().length < 5) {
      setErrorMessage("O título da ocorrência deve conter pelo menos 5 caracteres.");
      return;
    }
    if (!formData.local.trim() || formData.local.trim().length < 3) {
      setErrorMessage("Informe o local exato com pelo menos 3 caracteres.");
      return;
    }
    if (!formData.descricao.trim() || formData.descricao.trim().length < 10) {
      setErrorMessage("A descrição detalhada deve conter no mínimo 10 caracteres.");
      return;
    }

    try {
      setIsUploading(true);
      let uploadedPhotoUrl: string | null = null;

      // 1. Upload da foto se houver
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadJson.error || "Falha no envio da imagem.");
        }
        uploadedPhotoUrl = uploadJson.url;
      }

      // 2. Criação do chamado
      await createOcorrencia.mutateAsync({
        ...formData,
        foto_url: uploadedPhotoUrl,
      });

      router.push("/ocorrencias");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao registrar a ocorrência. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border border-[#EDF2F7] shadow-xs max-w-2xl mx-auto">
      <CardContent className="p-6 sm:p-8">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#545F72]">
              Título Resumido *
            </label>
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex.: Lâmpada queimada no hall do 3º andar"
              maxLength={100}
              disabled={isUploading}
              required
            />
            <p className="text-[11px] text-[#94A3B8]">
              Entre 5 e 100 caracteres. Seja claro e objetivo.
            </p>
          </div>

          {/* Categoria e Local */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#545F72] flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#0F4C81]" />
                Categoria *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoria: e.target.value as any,
                  })
                }
                disabled={isUploading}
                className="flex h-11 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#181C1E] focus:outline-hidden focus:border-[#0F4C81]"
                required
              >
                {CATEGORIAS_OCORRENCIA.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#545F72] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0F4C81]" />
                Local da Ocorrência *
              </label>
              <Input
                value={formData.local}
                onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                placeholder="Ex.: Torre B - Elevador Social"
                disabled={isUploading}
                required
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#545F72] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#0F4C81]" />
              Descrição Detalhada do Problema *
            </label>
            <Textarea
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              placeholder="Descreva o que aconteceu, horários, intensidade ou detalhes relevantes para auxiliar a administração na resolução..."
              rows={4}
              disabled={isUploading}
              required
            />
          </div>

          {/* Upload de Foto Opcional com Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#545F72]">
              Foto Comprobatória (Opcional)
            </label>

            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#CBD5E1] rounded-xl p-6 bg-[#F7FAFC] hover:bg-[#F1F4F6] cursor-pointer transition-colors">
                <UploadCloud className="w-8 h-8 text-[#0F4C81] mb-2" />
                <span className="text-xs font-semibold text-[#181C1E]">
                  Clique para anexar ou tire uma foto
                </span>
                <span className="text-[11px] text-[#545F72] mt-0.5">
                  Formatos aceitos: JPG, PNG ou WEBP (Máximo 5MB)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            ) : (
              <div className="relative rounded-xl border border-[#EDF2F7] overflow-hidden bg-[#F1F4F6]">
                <img
                  src={previewUrl}
                  alt="Pré-visualização do anexo"
                  className="w-full max-h-60 object-contain mx-auto"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  title="Remover foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#EDF2F7]">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="gap-2 min-w-[160px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gravando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Registrar Ocorrência
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    // 1. Validação de tamanho (máximo 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "A imagem não pode exceder o tamanho máximo de 5MB." },
        { status: 400 }
      );
    }

    // 2. Validação de formato MIME
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Formato inválido. Apenas imagens JPEG, PNG ou WEBP são aceitas.",
        },
        { status: 400 }
      );
    }

    // 3. Geração de nome único para o arquivo
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const filePath = `ocorrencias/${filename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = createAdminClient();

    const { error: uploadError } = await supabase.storage
      .from("ocorrencias-fotos")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Erro no upload para o Supabase Storage:", uploadError);
      return NextResponse.json(
        { error: "Erro ao salvar a imagem no servidor de arquivos." },
        { status: 500 }
      );
    }

    // 4. Obtenção da URL pública
    const { data: publicUrlData } = supabase.storage
      .from("ocorrencias-fotos")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    });
  } catch (err: any) {
    console.error("Erro inesperado em POST /api/upload:", err);
    return NextResponse.json(
      { error: "Erro ao processar o upload da imagem." },
      { status: 500 }
    );
  }
}


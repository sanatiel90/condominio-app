import { NextRequest, NextResponse } from "next/server";
import { moradorFormSchema } from "@/lib/validations/morador.schema";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = moradorFormSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Se estiver atualizando o e-mail, checa se outro morador já possui este e-mail
    if (parsed.data.email) {
      const emailLower = parsed.data.email.toLowerCase().trim();
      const { data: existente } = await supabase
        .from("moradores")
        .select("id")
        .ilike("email", emailLower)
        .neq("id", id)
        .maybeSingle();

      if (existente) {
        return NextResponse.json(
          { error: "Já existe outro morador utilizando este endereço de e-mail." },
          { status: 409 }
        );
      }
      parsed.data.email = emailLower;
    }

    const { data: atualizado, error: updateError } = await supabase
      .from("moradores")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Erro ao atualizar morador:", updateError);
      return NextResponse.json(
        { error: "Falha ao atualizar dados do morador." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      morador: atualizado,
    });
  } catch (err: any) {
    console.error("Erro em PATCH /api/moradores/[id]:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}


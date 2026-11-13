import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session-guard";

export async function GET() {
  try {
    const session = await getCurrentSession();
    return NextResponse.json({ user: session });
  } catch (err: any) {
    console.error("Erro ao verificar sessão ativa:", err);
    return NextResponse.json({ user: null });
  }
}


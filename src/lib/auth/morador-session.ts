import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { cookies } from "next/headers";
import { MoradorSession } from "@/types/database.types";

export const MORADOR_COOKIE_NAME = "condo_morador_session";

function getSecretKey(): Uint8Array {
  const secret = process.env.MORADOR_SESSION_SECRET || "chave-secreta-padrao-condominio-aurora-2026-min-32-chars";
  return new TextEncoder().encode(secret);
}

export async function signMoradorToken(payload: MoradorSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());
}

export async function verifyMoradorToken(token: string): Promise<MoradorSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== "morador") return null;

    return {
      id: payload.id as string,
      nome: payload.nome as string,
      email: payload.email as string,
      torre: payload.torre as string,
      apartamento: payload.apartamento as string,
      role: "morador",
    };
  } catch {
    return null;
  }
}

export async function getMoradorSession(): Promise<MoradorSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(MORADOR_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyMoradorToken(token);
}

export async function setMoradorCookie(payload: MoradorSession) {
  const token = await signMoradorToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(MORADOR_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
}

export async function clearMoradorCookie() {
  const cookieStore = await cookies();
  cookieStore.set(MORADOR_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}


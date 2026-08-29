import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createCoupleWithFounder } from "@/lib/server/onboarding";
import { MEMBER_COOKIE } from "@/lib/server/session";
import { normalizeCatChoice } from "@/lib/server/validation";

function isNativeClient(request: Request) {
  return request.headers.get("x-meow-client")?.toLowerCase() === "native";
}

export async function POST(request: Request) {
  const body = await request.json();
  const { nickname, catName, cat } = body ?? {};

  if (!nickname || typeof nickname !== "string" || nickname.trim().length === 0) {
    return NextResponse.json({ error: "Podaj swój nick." }, { status: 400 });
  }
  if (!catName || typeof catName !== "string" || catName.trim().length === 0) {
    return NextResponse.json({ error: "Nadaj imię swojemu kotu." }, { status: 400 });
  }
  const normalizedCat = normalizeCatChoice(cat);
  if (!normalizedCat) {
    return NextResponse.json({ error: "Wybierz poprawne ustawienia kota." }, { status: 400 });
  }

  const { token, inviteCode } = await createCoupleWithFounder({
    nickname: nickname.trim().slice(0, 24),
    catName: catName.trim().slice(0, 20),
    cat: normalizedCat,
  });

  // Web keeps its httpOnly cookie.
  const store = await cookies();
  store.set(MEMBER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  // Native gets the opaque session token only when it explicitly identifies itself.
  return NextResponse.json({
    inviteCode,
    ...(isNativeClient(request) ? { token } : {}),
  });
}

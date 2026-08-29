import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { joinCoupleWithPartner } from "@/lib/server/onboarding";
import { MEMBER_COOKIE } from "@/lib/server/session";
import { normalizeCatChoice } from "@/lib/server/validation";

function isNativeClient(request: Request) {
  return request.headers.get("x-meow-client")?.toLowerCase() === "native";
}

export async function POST(request: Request) {
  const body = await request.json();
  const { inviteCode, nickname, catName, cat } = body ?? {};

  if (!inviteCode || typeof inviteCode !== "string") {
    return NextResponse.json({ error: "Podaj kod dołączenia." }, { status: 400 });
  }
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

  const result = await joinCoupleWithPartner({
    inviteCode,
    nickname: nickname.trim().slice(0, 24),
    catName: catName.trim().slice(0, 20),
    cat: normalizedCat,
  });

  if (!result.ok) {
    const message =
      result.error === "not_found"
        ? "Nie znaleźliśmy takiego kodu. Sprawdźcie, czy jest wpisany poprawnie."
        : "Ta przestrzeń ma już dwoje mieszkańców.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const store = await cookies();
  store.set(MEMBER_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return NextResponse.json({
    ok: true,
    ...(isNativeClient(request) ? { token: result.token } : {}),
  });
}

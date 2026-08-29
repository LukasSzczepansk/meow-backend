import "server-only";
import { cookies, headers } from "next/headers";
import { db } from "@/db";
import { cats, couples, members } from "@/db/schema";
import { eq } from "drizzle-orm";

export const MEMBER_COOKIE = "meow_member_token";

export interface CurrentMember {
  memberId: string;
  nickname: string;
  coupleId: string;
  inviteCode: string;
  pawPoints: number;
  lifetimePoints: number;
  roomLevel: number;
  cat: {
    id: string;
    name: string;
    colorVariant: string;
    furLength: string;
    personality: string;
    accessory: string | null;
  } | null;
}

function readBearerToken(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  return token && token.length >= 16 ? token : null;
}

export async function getMemberToken(): Promise<string | null> {
  // Native app: opaque device/session token stored in Expo SecureStore.
  const headerStore = await headers();
  const bearer = readBearerToken(headerStore.get("authorization"));
  if (bearer) return bearer;

  // Web app: keep the existing httpOnly cookie flow.
  const cookieStore = await cookies();
  return cookieStore.get(MEMBER_COOKIE)?.value ?? null;
}

export async function getCurrentMember(): Promise<CurrentMember | null> {
  const token = await getMemberToken();
  if (!token) return null;

  const rows = await db
    .select({
      memberId: members.id,
      nickname: members.nickname,
      coupleId: couples.id,
      inviteCode: couples.inviteCode,
      pawPoints: couples.pawPoints,
      lifetimePoints: couples.lifetimePoints,
      roomLevel: couples.roomLevel,
      catId: cats.id,
      catName: cats.name,
      catColorVariant: cats.colorVariant,
      catFurLength: cats.furLength,
      catPersonality: cats.personality,
      catAccessory: cats.accessory,
    })
    .from(members)
    .innerJoin(couples, eq(members.coupleId, couples.id))
    .leftJoin(cats, eq(cats.memberId, members.id))
    .where(eq(members.deviceToken, token))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    memberId: row.memberId,
    nickname: row.nickname,
    coupleId: row.coupleId,
    inviteCode: row.inviteCode,
    pawPoints: row.pawPoints,
    lifetimePoints: row.lifetimePoints,
    roomLevel: row.roomLevel,
    cat: row.catId
      ? {
          id: row.catId,
          name: row.catName ?? "",
          colorVariant: row.catColorVariant ?? "white",
          furLength: row.catFurLength ?? "short",
          personality: row.catPersonality ?? "ciekawski",
          accessory: row.catAccessory,
        }
      : null,
  };
}

export async function getPartnerMember(coupleId: string, exceptMemberId: string) {
  const rows = await db
    .select({
      memberId: members.id,
      nickname: members.nickname,
      catId: cats.id,
      catName: cats.name,
      catColorVariant: cats.colorVariant,
      catFurLength: cats.furLength,
      catPersonality: cats.personality,
      catAccessory: cats.accessory,
    })
    .from(members)
    .leftJoin(cats, eq(cats.memberId, members.id))
    .where(eq(members.coupleId, coupleId));

  const partner = rows.find((r) => r.memberId !== exceptMemberId);
  if (!partner) return null;

  return {
    memberId: partner.memberId,
    nickname: partner.nickname,
    cat: partner.catId
      ? {
          id: partner.catId,
          name: partner.catName ?? "",
          colorVariant: partner.catColorVariant ?? "white",
          furLength: partner.catFurLength ?? "short",
          personality: partner.catPersonality ?? "ciekawski",
          accessory: partner.catAccessory,
        }
      : null,
  };
}

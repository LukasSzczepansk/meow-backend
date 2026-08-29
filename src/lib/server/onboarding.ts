import "server-only";
import { db } from "@/db";
import { cats, couples, members } from "@/db/schema";
import { customAlphabet, nanoid } from "nanoid";
import { and, eq, sql } from "drizzle-orm";

// Bez 0/O oraz 1/I, żeby kod łatwo było przepisać z ekranu.
const codeChars = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

async function generateUniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = `MEOW-${codeChars()}`;
    const existing = await db.select({ id: couples.id }).from(couples).where(eq(couples.inviteCode, code)).limit(1);
    if (existing.length === 0) return code;
  }
  throw new Error("Nie udało się wygenerować kodu zaproszenia.");
}

export interface CatChoice {
  colorVariant: string;
  furLength: string;
  personality: string;
  accessory?: string | null;
}

export interface CreateCoupleInput {
  nickname: string;
  catName: string;
  cat: CatChoice;
}

export async function createCoupleWithFounder(input: CreateCoupleInput) {
  const inviteCode = await generateUniqueInviteCode();
  const deviceToken = nanoid(32);

  const result = await db.transaction(async (tx) => {
    const [couple] = await tx.insert(couples).values({ inviteCode }).returning();
    const [member] = await tx
      .insert(members)
      .values({ coupleId: couple.id, nickname: input.nickname, deviceToken })
      .returning();

    await tx.insert(cats).values({
      memberId: member.id,
      name: input.catName,
      colorVariant: input.cat.colorVariant,
      furLength: input.cat.furLength,
      personality: input.cat.personality,
      accessory: input.cat.accessory ?? null,
    });

    return { couple, member };
  });

  return { token: deviceToken, inviteCode: result.couple.inviteCode };
}

export interface JoinCoupleInput extends CreateCoupleInput {
  inviteCode: string;
}

export type JoinCoupleResult =
  | { ok: true; token: string }
  | { ok: false; error: "not_found" | "full" };

export async function joinCoupleWithPartner(input: JoinCoupleInput): Promise<JoinCoupleResult> {
  const normalizedCode = input.inviteCode.trim().toUpperCase();
  const [couple] = await db.select().from(couples).where(eq(couples.inviteCode, normalizedCode)).limit(1);
  if (!couple) return { ok: false, error: "not_found" };

  const deviceToken = nanoid(32);

  return db.transaction(async (tx) => {
    // Blokujemy rekord pary na czas sprawdzenia liczby mieszkańców. Dzięki temu
    // dwa równoczesne dołączenia nie utworzą trzeciego członka pary.
    await tx.execute(sql`select id from ${couples} where ${couples.id} = ${couple.id} for update`);

    const existingMembers = await tx.select({ id: members.id }).from(members).where(eq(members.coupleId, couple.id));
    if (existingMembers.length >= 2) return { ok: false as const, error: "full" as const };

    const [member] = await tx
      .insert(members)
      .values({ coupleId: couple.id, nickname: input.nickname, deviceToken })
      .returning();

    await tx.insert(cats).values({
      memberId: member.id,
      name: input.catName,
      colorVariant: input.cat.colorVariant,
      furLength: input.cat.furLength,
      personality: input.cat.personality,
      accessory: input.cat.accessory ?? null,
    });

    return { ok: true as const, token: deviceToken };
  });
}

export async function isCoupleComplete(coupleId: string): Promise<boolean> {
  const rows = await db.select({ id: members.id }).from(members).where(eq(members.coupleId, coupleId));
  return rows.length >= 2;
}

export async function findMemberByToken(token: string) {
  const rows = await db.select().from(members).where(and(eq(members.deviceToken, token))).limit(1);
  return rows[0] ?? null;
}

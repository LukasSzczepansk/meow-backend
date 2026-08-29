import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentMember, MEMBER_COOKIE } from "@/lib/server/session";

export async function POST() {
  const member = await getCurrentMember();
  if (member) {
    // Rotacja tokenu unieważnia również Bearer zapisany wcześniej na telefonie.
    await db.update(members).set({ deviceToken: nanoid(48) }).where(eq(members.id, member.memberId));
  }
  const store = await cookies();
  store.delete(MEMBER_COOKIE);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { rewardTransactions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentMember } from "@/lib/server/session";

export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: "Brak sesji." }, { status: 401 });

  const rows = await db
    .select()
    .from(rewardTransactions)
    .where(eq(rewardTransactions.coupleId, member.coupleId))
    .orderBy(desc(rewardTransactions.createdAt))
    .limit(30);

  return NextResponse.json({ transactions: rows, pawPoints: member.pawPoints });
}

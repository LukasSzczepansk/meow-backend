import "server-only";
import { db } from "@/db";
import { couples, rewardTransactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}

export async function awardPaws(
  coupleId: string,
  amount: number,
  reason: string,
  options?: { memberId?: string | null; sourceId?: string | null; idempotencyKey?: string | null },
) {
  if (amount === 0) return { awarded: false };

  try {
    await db.transaction(async (tx) => {
      if (options?.idempotencyKey) {
        await tx.insert(rewardTransactions).values({
          coupleId,
          memberId: options.memberId ?? null,
          amount,
          reason,
          sourceId: options.sourceId ?? null,
          idempotencyKey: options.idempotencyKey,
        });
      }

      await tx
        .update(couples)
        .set({
          pawPoints: sql`${couples.pawPoints} + ${amount}`,
          lifetimePoints:
            amount > 0 ? sql`${couples.lifetimePoints} + ${amount}` : couples.lifetimePoints,
        })
        .where(eq(couples.id, coupleId));

      if (!options?.idempotencyKey) {
        await tx.insert(rewardTransactions).values({
          coupleId,
          memberId: options?.memberId ?? null,
          amount,
          reason,
          sourceId: options?.sourceId ?? null,
        });
      }
    });
    return { awarded: true };
  } catch (error) {
    if (options?.idempotencyKey && isUniqueViolation(error)) return { awarded: false };
    throw error;
  }
}

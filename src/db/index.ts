import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __meowPostgresqlPool?: Pool;
};

const configuredMax = Number(process.env.PG_POOL_MAX ?? "3");
const max = Number.isFinite(configuredMax) && configuredMax > 0
  ? Math.min(10, Math.round(configuredMax))
  : 3;

export const pool =
  globalForDb.__meowPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    max,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

// Reuse the pool inside warm serverless instances as well as local dev.
globalForDb.__meowPostgresqlPool = pool;

export const db = drizzle(pool);

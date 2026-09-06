import "server-only";

import { Pool } from "pg";

const globalForPg = globalThis as unknown as {
  pool?: Pool;
};

export const db =
  globalForPg.pool ??
  new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pool = db;
}

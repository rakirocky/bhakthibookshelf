import { Pool } from "pg";

const globalForPg = global as typeof global & {
  pgPool?: Pool;
};

export const pool =
  globalForPg.pgPool ??
  new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

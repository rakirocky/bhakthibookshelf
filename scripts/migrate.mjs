// Applies every SQL file in database/migrations/ that hasn't been
// recorded in the schema_migrations ledger yet, in filename order, each
// in its own transaction.
//
//   npm run migrate
//
// Connection comes from the same DB_* env vars the app uses
// (app/lib/db/db.ts). The npm script loads .env.local / .env via
// --env-file-if-exists; real environment variables take precedence, so
// this is safe to run on a server where DB_* are set for real.
//
// Every migration in this repo is written to be re-runnable, so running
// this against an already-migrated database simply back-fills the ledger.

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const MIGRATIONS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "database",
  "migrations"
);

const LEDGER = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename    TEXT PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`✗ ${name} is not set — cannot connect to the database.`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const client = new pg.Client({
    host: requireEnv("DB_HOST"),
    port: Number(process.env.DB_PORT ?? 5432),
    database: requireEnv("DB_NAME"),
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
  });

  await client.connect();
  console.log(
    `Connected to ${process.env.DB_NAME} at ${process.env.DB_HOST}:${
      process.env.DB_PORT ?? 5432
    }`
  );

  try {
    await client.query(LEDGER);

    const applied = new Set(
      (
        await client.query("SELECT filename FROM schema_migrations")
      ).rows.map((r) => r.filename)
    );

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const pending = files.filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log(`Nothing to do — ${files.length} migrations already applied.`);
      return;
    }

    console.log(`${pending.length} pending: ${pending.join(", ")}`);

    for (const file of pending) {
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");

      process.stdout.write(`  ${file} … `);

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING",
          [file]
        );
        await client.query("COMMIT");
        console.log("ok");
      } catch (err) {
        await client.query("ROLLBACK");
        console.log("FAILED");
        console.error(err);
        process.exitCode = 1;
        return;
      }
    }

    console.log("Done.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

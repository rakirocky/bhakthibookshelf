/**
 * Creates or updates an admin login.
 *
 * Usage:
 *   node scripts/seed-admin.js <phone> <password> ["Display Name"]
 *
 * Example:
 *   node scripts/seed-admin.js 8660388171 "myStrongPassword123"
 *   node scripts/seed-admin.js 8050682021 "anotherStrongPassword456" "Lakshmikanth"
 *
 * Run this once per admin phone number. Run it again with the same phone
 * and a new password to change that admin's password. This is also how
 * you add a new admin later — just run it with a new number.
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

// Next.js auto-loads .env.local for the app itself, but a standalone
// script like this doesn't get that for free — load it manually.
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eq = trimmed.indexOf("=");

    if (eq === -1) {
      continue;
    }

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvLocal();

  const [, , phone, password, name] = process.argv;

  if (!phone || !password) {
    console.error(
      "Usage: node scripts/seed-admin.js <phone> <password> [\"Display Name\"]"
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  const passwordHash = await bcrypt.hash(password, 12);

  const { rows } = await pool.query(
    `
    INSERT INTO admin_users (phone, name, password_hash, is_active)
    VALUES ($1, $2, $3, TRUE)
    ON CONFLICT (phone)
    DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      name = COALESCE(EXCLUDED.name, admin_users.name),
      is_active = TRUE,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id, phone, name, is_active
    `,
    [phone, name || null, passwordHash]
  );

  console.log("Admin login ready:", rows[0]);

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

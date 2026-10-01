import "../config/env.js";
import { readFile } from "node:fs/promises";
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";

try {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env");

  const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  const hash = await bcrypt.hash(password, 12);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(schema);
    await client.query(`INSERT INTO admins(email,password_hash) VALUES($1,$2)
      ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash`, [email, hash]);
    await client.query("COMMIT");
    console.log("Schema ready. Admin ready:", email);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}

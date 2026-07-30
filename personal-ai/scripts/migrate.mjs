import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import postgres from "postgres";

const dir = path.dirname(fileURLToPath(import.meta.url));
const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

const file = path.join(dir, "..", "migrations", "0001_init.sql");
const statements = readFileSync(file, "utf8");

const run = async () => {
  await sql.unsafe(statements);
  console.log("Migration applied.");
  await sql.end();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

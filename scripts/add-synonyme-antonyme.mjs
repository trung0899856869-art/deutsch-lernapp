import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const client = createClient({ url, authToken });

for (const col of ["synonyme", "antonyme"]) {
  try {
    await client.execute(`ALTER TABLE vokabeln ADD COLUMN ${col} TEXT DEFAULT '[]'`);
    console.log(`✓ Added column: ${col}`);
  } catch (e) {
    if (e.message?.includes("duplicate column") || e.message?.includes("already exists")) {
      console.log(`~ ${col} already exists, skipping`);
    } else {
      throw e;
    }
  }
}

console.log("Migration complete.");

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

// Lightweight idempotent column migrations — safe to run on every cold start
const NEW_COLUMNS = [
  "ALTER TABLE vokabeln ADD COLUMN synonyme TEXT DEFAULT '[]'",
  "ALTER TABLE vokabeln ADD COLUMN antonyme TEXT DEFAULT '[]'",
  "ALTER TABLE lesen_fragen ADD COLUMN optionen TEXT",
  "ALTER TABLE lesen_fragen ADD COLUMN korrekt_index INTEGER",
  "ALTER TABLE lesen_fragen ADD COLUMN ai_generated INTEGER NOT NULL DEFAULT 0",
];

(async () => {
  for (const stmt of NEW_COLUMNS) {
    try {
      await client.execute(stmt);
    } catch {
      // Column already exists — ignore
    }
  }
})().catch(() => {});

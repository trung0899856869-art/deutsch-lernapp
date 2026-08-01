"use server";

import { db } from "@/lib/db";
import { grammatik } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface GrammatikInput {
  kategorie: string;
  titel: string;
  inhalt: string;
  beispiele?: string;
  notes?: string;
  tags?: string[];
}

export async function createGrammatik(input: GrammatikInput) {
  const [entry] = await db.insert(grammatik).values({ ...input, tags: input.tags ?? [] }).returning();
  revalidatePath("/grammatik");
  return entry;
}

export async function updateGrammatik(id: string, input: Partial<GrammatikInput>) {
  const [entry] = await db
    .update(grammatik)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(grammatik.id, id))
    .returning();
  revalidatePath("/grammatik");
  return entry;
}

export async function deleteGrammatik(id: string) {
  await db.delete(grammatik).where(eq(grammatik.id, id));
  revalidatePath("/grammatik");
}

export async function getAllGrammatik() {
  return db.query.grammatik.findMany({ orderBy: (g, { asc }) => [asc(g.kategorie), asc(g.titel)] });
}

"use server";

import { db } from "@/lib/db";
import { schreiben } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface SchreibenInput {
  thema: string;
  inhalt: string;
  korrektur?: string;
  notes?: string;
  tags?: string[];
}

export async function createSchreiben(input: SchreibenInput) {
  const [entry] = await db.insert(schreiben).values({ ...input, tags: input.tags ?? [] }).returning();
  revalidatePath("/schreiben");
  return entry;
}

export async function updateSchreiben(id: string, input: Partial<SchreibenInput>) {
  const [entry] = await db
    .update(schreiben)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(schreiben.id, id))
    .returning();
  revalidatePath("/schreiben");
  return entry;
}

export async function deleteSchreiben(id: string) {
  await db.delete(schreiben).where(eq(schreiben.id, id));
  revalidatePath("/schreiben");
}

export async function getAllSchreiben() {
  return db.query.schreiben.findMany({ orderBy: (s, { desc }) => [desc(s.createdAt)] });
}

export async function getSchreibenById(id: string) {
  const [entry] = await db.select().from(schreiben).where(eq(schreiben.id, id));
  return entry ?? null;
}

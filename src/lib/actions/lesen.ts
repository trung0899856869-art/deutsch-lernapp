"use server";

import { db } from "@/lib/db";
import { lesenTexte, lesenFragen, wordForms, vokabeln } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface LesenTextInput {
  titel: string;
  inhalt: string;
  niveau?: string;
  thema?: string;
  notes?: string;
  tags?: string[];
}

export interface LesenFrageInput {
  textId: string;
  frage: string;
  antwort: string;
  optionen?: string[];
  korrektIndex?: number;
  aiGenerated?: number;
  sortOrder?: number;
}

export async function createLesenText(input: LesenTextInput) {
  const [entry] = await db.insert(lesenTexte).values({ ...input, tags: input.tags ?? [] }).returning();
  revalidatePath("/lesen");
  return entry;
}

export async function updateLesenText(id: string, input: Partial<LesenTextInput>) {
  const [entry] = await db
    .update(lesenTexte)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(lesenTexte.id, id))
    .returning();
  revalidatePath("/lesen");
  return entry;
}

export async function deleteLesenText(id: string) {
  await db.delete(lesenTexte).where(eq(lesenTexte.id, id));
  revalidatePath("/lesen");
}

export async function getAllLesenTexte() {
  const [texte, counts] = await Promise.all([
    db.query.lesenTexte.findMany({ orderBy: (t, { desc }) => [desc(t.createdAt)] }),
    db.select({ textId: lesenFragen.textId, count: count() })
      .from(lesenFragen)
      .groupBy(lesenFragen.textId),
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c.textId, c.count]));
  return texte.map((t) => ({ ...t, fragenCount: countMap[t.id] ?? 0 }));
}

export async function getLesenTextById(id: string) {
  const [text] = await db.select().from(lesenTexte).where(eq(lesenTexte.id, id));
  return text ?? null;
}

export async function createLesenFrage(input: LesenFrageInput) {
  const [entry] = await db.insert(lesenFragen).values(input).returning();
  revalidatePath(`/lesen/${input.textId}`);
  return entry;
}

export async function deleteLesenFrage(id: string, textId: string) {
  await db.delete(lesenFragen).where(eq(lesenFragen.id, id));
  revalidatePath(`/lesen/${textId}`);
}

export async function getFragenByTextId(textId: string) {
  return db
    .select()
    .from(lesenFragen)
    .where(eq(lesenFragen.textId, textId))
    .orderBy(lesenFragen.sortOrder);
}

/**
 * Load all word forms joined with vokabeln for building the highlight index.
 */
export async function getWordFormIndex() {
  const rows = await db
    .select({
      form: wordForms.form,
      wortart: vokabeln.wortart,
      vokabelId: vokabeln.id,
      grundform: vokabeln.grundform,
    })
    .from(wordForms)
    .innerJoin(vokabeln, eq(wordForms.vokabelId, vokabeln.id));
  return rows;
}

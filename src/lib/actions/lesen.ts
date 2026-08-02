"use server";

import { db } from "@/lib/db";
import { lesenTexte, lesenFragen, wordForms, vokabeln } from "@/lib/db/schema";
import { eq, count, and } from "drizzle-orm";
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

export async function generateLesenFragen(textId: string, inhalt: string, niveau: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY ist nicht konfiguriert");

  // Remove existing AI-generated questions before regenerating
  await db
    .delete(lesenFragen)
    .where(and(eq(lesenFragen.textId, textId), eq(lesenFragen.aiGenerated, 1)));

  const prompt = `Lies den folgenden deutschen Text (Niveau: ${niveau}) und erstelle genau 4 Multiple-Choice-Verständnisfragen auf Deutsch.
Jede Frage hat 4 Antwortmöglichkeiten (A–D), davon genau eine richtig.
Die Fragen sollen das Leseverständnis testen, nicht Grammatik oder Vokabeln.

Text:
${inhalt}

Antworte NUR mit gültigem JSON, ohne zusätzlichen Text:
{
  "fragen": [
    {
      "frage": "...",
      "optionen": ["...", "...", "...", "..."],
      "korrektIndex": 0
    }
  ]
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);

  const data = await res.json();
  const raw: string = data.content?.[0]?.text ?? "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Ungültiges AI-Antwortformat");

  const parsed = JSON.parse(jsonMatch[0]) as {
    fragen: { frage: string; optionen: string[]; korrektIndex: number }[];
  };

  for (let i = 0; i < parsed.fragen.length; i++) {
    const f = parsed.fragen[i];
    await db.insert(lesenFragen).values({
      textId,
      frage: f.frage,
      antwort: f.optionen[f.korrektIndex] ?? "",
      optionen: f.optionen,
      korrektIndex: f.korrektIndex,
      aiGenerated: 1,
      sortOrder: i,
    });
  }

  revalidatePath(`/lesen/${textId}`);
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

"use server";

import { db } from "@/lib/db";
import { sprechenDialoge, sprechenFragekarten } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ─── Dialoge ────────────────────────────────────────────────────────────────

export interface DialogZeile {
  sprecher: string;
  text: string;
}

export interface DialogInput {
  titel: string;
  zeilen: DialogZeile[];
  thema?: string;
  notes?: string;
  tags?: string[];
}

export async function createDialog(input: DialogInput) {
  const [entry] = await db
    .insert(sprechenDialoge)
    .values({ ...input, tags: input.tags ?? [] })
    .returning();
  revalidatePath("/sprechen");
  return entry;
}

export async function updateDialog(id: string, input: Partial<DialogInput>) {
  const [entry] = await db
    .update(sprechenDialoge)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(sprechenDialoge.id, id))
    .returning();
  revalidatePath("/sprechen");
  return entry;
}

export async function deleteDialog(id: string) {
  await db.delete(sprechenDialoge).where(eq(sprechenDialoge.id, id));
  revalidatePath("/sprechen");
}

export async function getAllDialoge() {
  return db.query.sprechenDialoge.findMany({ orderBy: (d, { desc }) => [desc(d.createdAt)] });
}

export async function getDialogById(id: string) {
  const [entry] = await db.select().from(sprechenDialoge).where(eq(sprechenDialoge.id, id));
  return entry ?? null;
}

// ─── Fragekarten ─────────────────────────────────────────────────────────────

export interface FragekarteInput {
  thema: string;
  vokabelHinweis?: string;
  musterfrage?: string;
  musterantwort?: string;
  notes?: string;
  tags?: string[];
}

export async function createFragekarte(input: FragekarteInput) {
  const [entry] = await db
    .insert(sprechenFragekarten)
    .values({ ...input, tags: input.tags ?? [] })
    .returning();
  revalidatePath("/sprechen/fragekarten");
  return entry;
}

export async function updateFragekarte(id: string, input: Partial<FragekarteInput>) {
  const [entry] = await db
    .update(sprechenFragekarten)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(sprechenFragekarten.id, id))
    .returning();
  revalidatePath("/sprechen/fragekarten");
  return entry;
}

export async function deleteFragekarte(id: string) {
  await db.delete(sprechenFragekarten).where(eq(sprechenFragekarten.id, id));
  revalidatePath("/sprechen/fragekarten");
}

export async function getAllFragekarten() {
  return db.query.sprechenFragekarten.findMany({ orderBy: (f, { desc }) => [desc(f.createdAt)] });
}

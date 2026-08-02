"use server";

import { db } from "@/lib/db";
import { grammatik, grammatikSrs } from "@/lib/db/schema";
import { eq, lte, or, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { initialSrsState, toLocalDateString, type SrsState } from "@/lib/srs";

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
  await db.insert(grammatikSrs).values({ grammatikId: entry.id, ...initialSrsState() });
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

export async function getDueGrammatikCards() {
  const today = toLocalDateString(new Date());
  return db
    .select({
      id: grammatik.id,
      kategorie: grammatik.kategorie,
      titel: grammatik.titel,
      inhalt: grammatik.inhalt,
      beispiele: grammatik.beispiele,
      notes: grammatik.notes,
      srsId: grammatikSrs.id,
      interval: grammatikSrs.interval,
      repetition: grammatikSrs.repetition,
      efactor: grammatikSrs.efactor,
      dueDate: grammatikSrs.dueDate,
    })
    .from(grammatik)
    .leftJoin(grammatikSrs, eq(grammatik.id, grammatikSrs.grammatikId))
    .where(or(lte(grammatikSrs.dueDate, today), isNull(grammatikSrs.dueDate)));
}

export async function getDueGrammatikCount(): Promise<number> {
  const cards = await getDueGrammatikCards();
  return cards.length;
}

export async function updateGrammatikSrs(
  grammatikId: string,
  srsId: string | null,
  update: SrsState
) {
  if (srsId) {
    await db
      .update(grammatikSrs)
      .set({ ...update, lastReviewed: new Date() })
      .where(eq(grammatikSrs.id, srsId));
  } else {
    // Lazy-init SRS entry for cards created before SRS was added
    await db.insert(grammatikSrs).values({ grammatikId, ...update });
  }
  revalidatePath("/grammatik/ueben");
}

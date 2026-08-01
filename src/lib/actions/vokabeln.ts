"use server";

import { db } from "@/lib/db";
import { vokabeln, vokabelnSrs, wordForms, srsReviews } from "@/lib/db/schema";
import { getAllWordForms } from "@/lib/word-forms";
import { initialSrsState } from "@/lib/srs";
import { eq, lte, and, isNull, or, count, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { Wortart } from "@/lib/constants";

export interface VokabelInput {
  wortart: Wortart;
  grundform: string;
  bedeutung: string;
  // Substantiv
  artikel?: string;
  pluralSuffix?: string;
  pluralForm?: string;
  // Verb
  partizip2?: string;
  hilfsverb?: string;
  praesensEr?: string;
  praeteritum?: string;
  // Adjektiv
  komparativ?: string;
  superlativ?: string;
  // Shared
  beispiel?: string;
  notes?: string;
  tags?: string[];
}

export async function createVokabel(input: VokabelInput) {
  const [entry] = await db
    .insert(vokabeln)
    .values({
      wortart: input.wortart,
      grundform: input.grundform,
      bedeutung: input.bedeutung,
      artikel: input.artikel,
      pluralSuffix: input.pluralSuffix,
      pluralForm: input.pluralForm,
      partizip2: input.partizip2,
      hilfsverb: input.hilfsverb,
      praesensEr: input.praesensEr,
      praeteritum: input.praeteritum,
      komparativ: input.komparativ,
      superlativ: input.superlativ,
      beispiel: input.beispiel,
      notes: input.notes,
      tags: input.tags ?? [],
    })
    .returning();

  // SRS initial state
  const srsState = initialSrsState();
  await db.insert(vokabelnSrs).values({
    vokabelId: entry.id,
    ...srsState,
  });

  // Pre-compute word forms for text highlighting
  const forms = getAllWordForms({
    wortart: input.wortart,
    grundform: input.grundform,
    artikel: input.artikel,
    pluralSuffix: input.pluralSuffix,
    partizip2: input.partizip2,
    praesensEr: input.praesensEr,
    praeteritum: input.praeteritum,
    komparativ: input.komparativ,
    superlativ: input.superlativ,
  });

  if (forms.length > 0) {
    await db.insert(wordForms).values(
      forms.map((form) => ({ vokabelId: entry.id, form }))
    );
  }

  revalidatePath("/vokabeln");
  return entry;
}

export async function updateVokabel(id: string, input: Partial<VokabelInput>) {
  const [entry] = await db
    .update(vokabeln)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(vokabeln.id, id))
    .returning();

  // Recompute word forms
  await db.delete(wordForms).where(eq(wordForms.vokabelId, id));
  const current = entry;
  const forms = getAllWordForms({
    wortart: current.wortart as Wortart,
    grundform: current.grundform,
    artikel: current.artikel ?? undefined,
    pluralSuffix: current.pluralSuffix ?? undefined,
    partizip2: current.partizip2 ?? undefined,
    praesensEr: current.praesensEr ?? undefined,
    praeteritum: current.praeteritum ?? undefined,
    komparativ: current.komparativ ?? undefined,
    superlativ: current.superlativ ?? undefined,
  });
  if (forms.length > 0) {
    await db.insert(wordForms).values(
      forms.map((form) => ({ vokabelId: id, form }))
    );
  }

  revalidatePath("/vokabeln");
  return entry;
}

export async function deleteVokabel(id: string) {
  await db.delete(vokabeln).where(eq(vokabeln.id, id));
  revalidatePath("/vokabeln");
}

export async function getAllVokabeln() {
  return db.query.vokabeln.findMany({ orderBy: (v, { desc }) => [desc(v.createdAt)] });
}

export async function getDueVokabeln() {
  const d = new Date();
  const today = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  return db
    .select({
      id: vokabeln.id,
      wortart: vokabeln.wortart,
      grundform: vokabeln.grundform,
      bedeutung: vokabeln.bedeutung,
      artikel: vokabeln.artikel,
      pluralSuffix: vokabeln.pluralSuffix,
      pluralForm: vokabeln.pluralForm,
      partizip2: vokabeln.partizip2,
      hilfsverb: vokabeln.hilfsverb,
      praesensEr: vokabeln.praesensEr,
      praeteritum: vokabeln.praeteritum,
      komparativ: vokabeln.komparativ,
      superlativ: vokabeln.superlativ,
      beispiel: vokabeln.beispiel,
      notes: vokabeln.notes,
      tags: vokabeln.tags,
      srsId: vokabelnSrs.id,
      interval: vokabelnSrs.interval,
      repetition: vokabelnSrs.repetition,
      efactor: vokabelnSrs.efactor,
      dueDate: vokabelnSrs.dueDate,
      lastReviewed: vokabelnSrs.lastReviewed,
    })
    .from(vokabeln)
    .leftJoin(vokabelnSrs, eq(vokabeln.id, vokabelnSrs.vokabelId))
    .where(
      or(
        lte(vokabelnSrs.dueDate, today),
        isNull(vokabelnSrs.dueDate)
      )
    );
}

export async function getVokabelnStats() {
  const d = new Date();
  const toLocalDate = (date: Date) =>
    [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  const today = toLocalDate(d);
  const nextWeek = toLocalDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));

  const rows = await db
    .select({
      wortart: vokabeln.wortart,
      interval: vokabelnSrs.interval,
      lastReviewed: vokabelnSrs.lastReviewed,
      dueDate: vokabelnSrs.dueDate,
    })
    .from(vokabeln)
    .leftJoin(vokabelnSrs, eq(vokabeln.id, vokabelnSrs.vokabelId));

  const byWortart: Record<string, number> = {};
  let newCards = 0, learning = 0, mature = 0, dueToday = 0, dueThisWeek = 0;

  for (const r of rows) {
    byWortart[r.wortart] = (byWortart[r.wortart] ?? 0) + 1;
    if (!r.lastReviewed) newCards++;
    else if ((r.interval ?? 1) >= 21) mature++;
    else learning++;
    if (r.dueDate && r.dueDate <= today) dueToday++;
    if (r.dueDate && r.dueDate <= nextWeek) dueThisWeek++;
  }

  const [totalReviews, goodReviews] = await Promise.all([
    db.select({ c: count() }).from(srsReviews),
    db.select({ c: count() }).from(srsReviews).where(gte(srsReviews.quality, 3)),
  ]);
  const retentionRate =
    totalReviews[0].c > 0
      ? Math.round((goodReviews[0].c / totalReviews[0].c) * 100)
      : null;

  return { total: rows.length, newCards, learning, mature, dueToday, dueThisWeek, byWortart, retentionRate };
}

export async function updateSrs(
  srsId: string,
  update: { interval: number; repetition: number; efactor: number; dueDate: string },
  vokabelId: string,
  quality: number
) {
  await Promise.all([
    db.update(vokabelnSrs)
      .set({ ...update, lastReviewed: new Date() })
      .where(eq(vokabelnSrs.id, srsId)),
    db.insert(srsReviews).values({ vokabelId, quality }),
  ]);
  revalidatePath("/vokabeln/ueben");
}

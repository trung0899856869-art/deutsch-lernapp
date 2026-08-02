"use server";

import { db } from "@/lib/db";
import { vokabeln, vokabelnSrs, wordForms, srsReviews } from "@/lib/db/schema";
import { getAllWordForms } from "@/lib/word-forms";
import { initialSrsState, toLocalDateString } from "@/lib/srs";
import { eq, lte, and, isNull, or, count, gte, sql, ne } from "drizzle-orm";
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
  verbtyp?: string;      // "normal" | "trennbar" | "untrennbar"
  praefixVerb?: string;  // e.g. "an" for "anrufen"
  partizip2?: string;
  hilfsverb?: string;
  praesensIch?: string;
  praesensDu?: string;
  praesensEr?: string;
  praesensWir?: string;
  praesensIhr?: string;
  praesensSie?: string;
  praeteritum?: string;
  // Adjektiv
  komparativ?: string;
  superlativ?: string;
  // Shared
  beispiel?: string;
  notes?: string;
  tags?: string[];
  synonyme?: string[];
  antonyme?: string[];
}

// Propagate reverse synonym/antonym links to existing words
async function syncReverseLinks(newId: string, newGrundform: string, synonyme: string[], antonyme: string[]) {
  for (const syn of synonyme) {
    const matches = await db.select({ id: vokabeln.id, synonyme: vokabeln.synonyme }).from(vokabeln)
      .where(sql`LOWER(${vokabeln.grundform}) = LOWER(${syn})`);
    for (const match of matches) {
      if (match.id === newId) continue;
      const current = (match.synonyme ?? []) as string[];
      if (!current.some((s) => s.toLowerCase() === newGrundform.toLowerCase())) {
        await db.update(vokabeln).set({ synonyme: [...current, newGrundform] }).where(eq(vokabeln.id, match.id));
      }
    }
  }
  for (const ant of antonyme) {
    const matches = await db.select({ id: vokabeln.id, antonyme: vokabeln.antonyme }).from(vokabeln)
      .where(sql`LOWER(${vokabeln.grundform}) = LOWER(${ant})`);
    for (const match of matches) {
      if (match.id === newId) continue;
      const current = (match.antonyme ?? []) as string[];
      if (!current.some((a) => a.toLowerCase() === newGrundform.toLowerCase())) {
        await db.update(vokabeln).set({ antonyme: [...current, newGrundform] }).where(eq(vokabeln.id, match.id));
      }
    }
  }
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
      verbtyp: input.verbtyp,
      praefixVerb: input.praefixVerb,
      partizip2: input.partizip2,
      hilfsverb: input.hilfsverb,
      praesensIch: input.praesensIch,
      praesensDu: input.praesensDu,
      praesensEr: input.praesensEr,
      praesensWir: input.praesensWir,
      praesensIhr: input.praesensIhr,
      praesensSie: input.praesensSie,
      praeteritum: input.praeteritum,
      komparativ: input.komparativ,
      superlativ: input.superlativ,
      beispiel: input.beispiel,
      notes: input.notes,
      tags: input.tags ?? [],
      synonyme: input.synonyme ?? [],
      antonyme: input.antonyme ?? [],
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

  await syncReverseLinks(entry.id, entry.grundform, input.synonyme ?? [], input.antonyme ?? []);

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

  await syncReverseLinks(id, entry.grundform, (input.synonyme ?? []), (input.antonyme ?? []));

  revalidatePath("/vokabeln");
  return entry;
}

export async function deleteVokabel(id: string) {
  await db.delete(vokabeln).where(eq(vokabeln.id, id));
  revalidatePath("/vokabeln");
}

export async function getVokabelGrundformenList() {
  return db
    .select({ id: vokabeln.id, grundform: vokabeln.grundform, wortart: vokabeln.wortart, artikel: vokabeln.artikel })
    .from(vokabeln)
    .orderBy(vokabeln.grundform);
}

export async function checkDuplicateGrundform(grundform: string, excludeId?: string) {
  const trimmed = grundform.trim();
  if (!trimmed) return [];
  const rows = await db
    .select({
      id: vokabeln.id,
      wortart: vokabeln.wortart,
      grundform: vokabeln.grundform,
      artikel: vokabeln.artikel,
      bedeutung: vokabeln.bedeutung,
    })
    .from(vokabeln)
    .where(sql`LOWER(${vokabeln.grundform}) = LOWER(${trimmed})`);
  return excludeId ? rows.filter((r) => r.id !== excludeId) : rows;
}

export async function getAllVokabeln() {
  return db.query.vokabeln.findMany({ orderBy: (v, { desc }) => [desc(v.createdAt)] });
}

export async function getDueVokabeln() {
  const today = toLocalDateString(new Date());
  return db
    .select({
      id: vokabeln.id,
      wortart: vokabeln.wortart,
      grundform: vokabeln.grundform,
      bedeutung: vokabeln.bedeutung,
      artikel: vokabeln.artikel,
      pluralSuffix: vokabeln.pluralSuffix,
      pluralForm: vokabeln.pluralForm,
      verbtyp: vokabeln.verbtyp,
      praefixVerb: vokabeln.praefixVerb,
      partizip2: vokabeln.partizip2,
      hilfsverb: vokabeln.hilfsverb,
      praesensIch: vokabeln.praesensIch,
      praesensDu: vokabeln.praesensDu,
      praesensEr: vokabeln.praesensEr,
      praesensWir: vokabeln.praesensWir,
      praesensIhr: vokabeln.praesensIhr,
      praesensSie: vokabeln.praesensSie,
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
  const today = toLocalDateString(d);
  const nextWeek = toLocalDateString(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));

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

export async function getWordFormIndexExcluding(excludeWortart: string) {
  const rows = await db
    .select({
      form: wordForms.form,
      wortart: vokabeln.wortart,
      vokabelId: vokabeln.id,
      grundform: vokabeln.grundform,
    })
    .from(wordForms)
    .innerJoin(vokabeln, eq(wordForms.vokabelId, vokabeln.id))
    .where(ne(vokabeln.wortart, excludeWortart));
  return rows;
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

import { db } from "@/lib/db";
import { vokabeln, vokabelnSrs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const HEADERS = [
  "wortart", "grundform", "artikel", "bedeutung",
  "pluralForm", "verbtyp", "praefixVerb", "partizip2", "hilfsverb",
  "praesensIch", "praesensDu", "praesensEr", "praesensWir", "praesensIhr", "praesensSie",
  "praeteritum", "komparativ", "superlativ", "beispiel", "notes", "tags",
  "synonyme", "antonyme",
  "interval", "repetition", "dueDate",
] as const;

function escapeCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = Array.isArray(v) ? v.join(";") : String(v);
  return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const rows = await db
    .select({
      wortart: vokabeln.wortart,
      grundform: vokabeln.grundform,
      artikel: vokabeln.artikel,
      bedeutung: vokabeln.bedeutung,
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
      synonyme: vokabeln.synonyme,
      antonyme: vokabeln.antonyme,
      interval: vokabelnSrs.interval,
      repetition: vokabelnSrs.repetition,
      dueDate: vokabelnSrs.dueDate,
    })
    .from(vokabeln)
    .leftJoin(vokabelnSrs, eq(vokabeln.id, vokabelnSrs.vokabelId));

  const csv = [
    HEADERS.join(","),
    ...rows.map((row) =>
      HEADERS.map((h) => escapeCell(row[h])).join(",")
    ),
  ].join("\n");

  const date = new Date().toISOString().split("T")[0];
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vokabeln-${date}.csv"`,
    },
  });
}

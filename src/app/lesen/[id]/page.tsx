export const dynamic = "force-dynamic";
import { getLesenTextById, getFragenByTextId, getWordFormIndex } from "@/lib/actions/lesen";
import { notFound } from "next/navigation";
import { LesenInteractiveArea } from "@/components/lesen/LesenInteractiveArea";
import { FragenSektion } from "@/components/lesen/FragenSektion";
import Link from "next/link";
import type { WordFormMatch } from "@/lib/text-highlighter";
import type { Wortart } from "@/lib/constants";

export default async function LesenTextPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [text, fragen, formRows] = await Promise.all([
    getLesenTextById(id),
    getFragenByTextId(id),
    getWordFormIndex(),
  ]);

  if (!text) notFound();

  const typedFormRows: WordFormMatch[] = formRows.map((r) => ({
    form: r.form,
    wortart: r.wortart as Wortart,
    vokabelId: r.vokabelId,
    grundform: r.grundform,
  }));

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/lesen" className="text-gray-400 hover:text-gray-600">← Zurück</Link>
        <div className="flex-1" />
        <Link
          href={`/lesen/${id}/bearbeiten`}
          className="text-sm text-blue-600 hover:underline"
        >
          Bearbeiten
        </Link>
      </div>

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{text.titel}</h1>
        <div className="flex items-center gap-2 mt-1">
          {text.niveau && (
            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded px-1.5 py-0.5">
              {text.niveau}
            </span>
          )}
          {text.thema && <span className="text-sm text-gray-500">{text.thema}</span>}
        </div>
      </div>

      {/* Interactive reading area — click any underlined word for full vocab detail */}
      <LesenInteractiveArea text={text.inhalt} formRows={typedFormRows} />

      {/* Notes */}
      {text.notes && (
        <div className="mb-6 text-sm text-gray-500 italic">{text.notes}</div>
      )}

      {/* Comprehension questions */}
      <FragenSektion textId={id} fragen={fragen} />
    </div>
  );
}

export const dynamic = "force-dynamic";
import { getSchreibenById } from "@/lib/actions/schreiben";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function SchreibenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await getSchreibenById(id);
  if (!entry) notFound();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/schreiben" className="text-gray-400 hover:text-gray-600">← Zurück</Link>
        <div className="flex-1" />
        <Link href={`/schreiben/${id}/bearbeiten`} className="text-sm text-blue-600 hover:underline">
          Bearbeiten
        </Link>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-1">{entry.thema}</h1>
      <p className="text-xs text-gray-400 mb-4">
        {new Date(entry.createdAt).toLocaleDateString("de-DE")}
      </p>

      {/* My text */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Mein Text
        </h2>
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{entry.inhalt}</p>
      </div>

      {/* Correction */}
      {entry.korrektur && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-5 shadow-sm mb-4">
          <h2 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3">
            Korrektur
          </h2>
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{entry.korrektur}</p>
        </div>
      )}

      {/* Notes */}
      {entry.notes && (
        <p className="text-sm text-gray-500 italic mb-4">{entry.notes}</p>
      )}

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
import { getAllLesenTexte } from "@/lib/actions/lesen";
import Link from "next/link";
import { deleteLesenText } from "@/lib/actions/lesen";

export default async function LesenPage() {
  const texte = await getAllLesenTexte();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lesen</h1>
        <Link
          href="/lesen/neu"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Neu
        </Link>
      </div>

      {texte.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📄</p>
          <p>Noch keine Texte. Füge deinen ersten Lesetext hinzu!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {texte.map((t) => (
            <Link
              key={t.id}
              href={`/lesen/${t.id}`}
              className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-blue-300 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{t.titel}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {t.niveau && (
                      <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded px-1.5 py-0.5">
                        {t.niveau}
                      </span>
                    )}
                    {t.thema && <span className="text-xs text-gray-500">{t.thema}</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{t.inhalt}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

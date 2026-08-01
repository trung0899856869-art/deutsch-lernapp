export const dynamic = "force-dynamic";
import { getAllSchreiben } from "@/lib/actions/schreiben";
import Link from "next/link";

export default async function SchreibenPage() {
  const eintraege = await getAllSchreiben();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Schreiben</h1>
        <Link
          href="/schreiben/neu"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Neuer Text
        </Link>
      </div>

      {eintraege.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">✍️</p>
          <p>Noch keine Texte. Fang an zu schreiben!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {eintraege.map((e) => (
            <Link
              key={e.id}
              href={`/schreiben/${e.id}`}
              className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-blue-300 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900">{e.thema}</h2>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{e.inhalt}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {e.korrektur && (
                      <span className="text-xs bg-green-50 text-green-600 border border-green-200 rounded px-1.5 py-0.5">
                        Korrigiert
                      </span>
                    )}
                    {e.tags?.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0 ml-3">
                  {new Date(e.createdAt).toLocaleDateString("de-DE")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

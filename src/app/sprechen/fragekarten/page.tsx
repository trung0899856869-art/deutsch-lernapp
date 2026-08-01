export const dynamic = "force-dynamic";
import { getAllFragekarten } from "@/lib/actions/sprechen";
import { FragekartenSpiel } from "@/components/sprechen/FragekartenSpiel";
import Link from "next/link";

export default async function FragekartenPage() {
  const karten = await getAllFragekarten();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/sprechen" className="text-gray-400 hover:text-gray-600">← Zurück</Link>
          <h1 className="text-xl font-bold text-gray-900">Fragekarten</h1>
        </div>
        <Link
          href="/sprechen/fragekarten/neu"
          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Karte
        </Link>
      </div>

      {/* Spiel */}
      {karten.length > 0 && (
        <div className="mb-8">
          <FragekartenSpiel karten={karten} />
        </div>
      )}

      {/* Liste */}
      {karten.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Alle Karten ({karten.length})
          </h2>
          <div className="space-y-2">
            {karten.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-800">{k.thema}</p>
                  {k.vokabelHinweis && (
                    <p className="text-xs text-gray-500">{k.vokabelHinweis}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {karten.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🃏</p>
          <p>Noch keine Karten. Füge deine erste Fragekarte hinzu!</p>
        </div>
      )}
    </div>
  );
}

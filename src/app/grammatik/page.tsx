export const dynamic = "force-dynamic";
import { getAllGrammatik } from "@/lib/actions/grammatik";
import { GrammatikCard } from "@/components/grammatik/GrammatikCard";
import Link from "next/link";

export default async function GrammatikPage() {
  const eintraege = await getAllGrammatik();

  // Group by Kategorie
  const grouped = eintraege.reduce<Record<string, typeof eintraege>>((acc, e) => {
    if (!acc[e.kategorie]) acc[e.kategorie] = [];
    acc[e.kategorie].push(e);
    return acc;
  }, {});

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Grammatik</h1>
        <Link
          href="/grammatik/neu"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Neu
        </Link>
      </div>

      {eintraege.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p>Noch keine Grammatiknotizen. Füge deine erste Regel hinzu!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([kat, items]) => (
            <div key={kat}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {kat}
              </h2>
              <div className="space-y-2">
                {items.map((e) => (
                  <GrammatikCard key={e.id} eintrag={e} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
import { getAllDialoge } from "@/lib/actions/sprechen";
import Link from "next/link";

export default async function SprechenPage() {
  const dialoge = await getAllDialoge();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sprechen</h1>
        <div className="flex gap-2">
          <Link
            href="/sprechen/fragekarten"
            className="px-3 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm hover:bg-blue-50 transition-colors"
          >
            🃏 Fragekarten
          </Link>
          <Link
            href="/sprechen/dialoge/neu"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Dialog
          </Link>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Dialoge</h2>

      {dialoge.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p>Noch keine Dialoge. Füge deinen ersten Dialog hinzu!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dialoge.map((d) => (
            <Link
              key={d.id}
              href={`/sprechen/dialoge/${d.id}`}
              className="block rounded-lg bg-white border border-gray-200 p-4 hover:border-blue-300 transition-colors shadow-sm"
            >
              <h3 className="font-semibold text-gray-900">{d.titel}</h3>
              {d.thema && <p className="text-sm text-gray-500 mt-0.5">{d.thema}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {Array.isArray(d.zeilen) ? (d.zeilen as unknown[]).length : 0} Zeilen
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

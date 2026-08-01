export const dynamic = "force-dynamic";
import { getAllVokabeln, getDueVokabeln } from "@/lib/actions/vokabeln";
import { VokabelListe } from "@/components/vokabeln/VokabelListe";
import Link from "next/link";

export default async function VokabelnPage() {
  const [alle, faellig] = await Promise.all([getAllVokabeln(), getDueVokabeln()]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vokabeln</h1>
        <div className="flex gap-2">
          {alle.length > 0 && (
            <Link
              href="/vokabeln/ueben"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              🃏 Üben{faellig.length > 0 ? ` (${faellig.length})` : ""}
            </Link>
          )}
          <Link
            href="/vokabeln/neu"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Neu hinzufügen
          </Link>
        </div>
      </div>

      {/* SRS review banner — only when cards are due */}
      {faellig.length > 0 && (
        <Link
          href="/vokabeln/ueben"
          className="block mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-800">
                {faellig.length} Karte{faellig.length > 1 ? "n" : ""} zum Üben
              </p>
              <p className="text-sm text-blue-600 mt-0.5">Jetzt wiederholen →</p>
            </div>
            <span className="text-3xl">📚</span>
          </div>
        </Link>
      )}

      {/* Vocabulary list */}
      {alle.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📖</p>
          <p>Noch keine Vokabeln. Füge deine erste Vokabel hinzu!</p>
        </div>
      ) : (
        <VokabelListe vokabeln={alle} />
      )}
    </div>
  );
}

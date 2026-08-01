export const dynamic = "force-dynamic";
import { getDueVokabeln } from "@/lib/actions/vokabeln";
import { SrsFlashcard } from "@/components/vokabeln/SrsFlashcard";
import Link from "next/link";

const NEW_CARDS_DAILY_LIMIT = 10;

export default async function VokabelnUebenPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const allDue = await getDueVokabeln();

  // Apply tag filter
  const tagFiltered = tag
    ? allDue.filter((c) => c.tags?.includes(tag))
    : allDue;

  // Split: review cards (already reviewed before) vs new cards (never reviewed)
  const reviewCards = tagFiltered.filter((c) => c.lastReviewed !== null);
  const newCards = tagFiltered.filter((c) => c.lastReviewed === null);
  const hiddenNewCount = Math.max(0, newCards.length - NEW_CARDS_DAILY_LIMIT);
  const cards = [...reviewCards, ...newCards.slice(0, NEW_CARDS_DAILY_LIMIT)];

  // Unique tags from all due cards for the filter chips
  const allTags = [...new Set(allDue.flatMap((c) => c.tags ?? []))].sort();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/vokabeln" className="text-gray-400 hover:text-gray-600">
          ← Zurück
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          Vokabeln üben{tag ? ` · ${tag}` : ""}
        </h1>
      </div>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <Link
            href="/vokabeln/ueben"
            className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
              !tag
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            Alle
          </Link>
          {allTags.map((t) => (
            <Link
              key={t}
              href={`/vokabeln/ueben?tag=${encodeURIComponent(t)}`}
              className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                tag === t
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      )}

      {/* Daily new card limit notice */}
      {hiddenNewCount > 0 && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-700">
          📅 {hiddenNewCount} neue Karte{hiddenNewCount !== 1 ? "n" : ""} für morgen reserviert
          <span className="text-amber-500"> (Tageslimit: {NEW_CARDS_DAILY_LIMIT})</span>
        </div>
      )}

      <SrsFlashcard cards={cards} />
    </div>
  );
}

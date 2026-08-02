export const dynamic = "force-dynamic";
import { getDueGrammatikCards } from "@/lib/actions/grammatik";
import { GrammatikFlashcard } from "@/components/grammatik/GrammatikFlashcard";
import Link from "next/link";

export default async function GrammatikUebenPage() {
  const cards = await getDueGrammatikCards();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Grammatik — Üben</h1>
        <Link href="/grammatik" className="text-sm text-gray-500 hover:text-gray-700">
          ← Zurück
        </Link>
      </div>
      <GrammatikFlashcard cards={cards} />
    </div>
  );
}

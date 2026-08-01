"use client";

import { useState, useMemo } from "react";
import { VokabelCard } from "./VokabelCard";

interface Vokabel {
  id: string;
  wortart: string;
  grundform: string;
  bedeutung: string;
  artikel?: string | null;
  pluralSuffix?: string | null;
  pluralForm?: string | null;
  partizip2?: string | null;
  hilfsverb?: string | null;
  praesensEr?: string | null;
  praeteritum?: string | null;
  komparativ?: string | null;
  superlativ?: string | null;
  beispiel?: string | null;
  notes?: string | null;
  tags?: string[] | null;
}

export function VokabelListe({ vokabeln }: { vokabeln: Vokabel[] }) {
  const [query, setQuery] = useState("");

  const gefiltert = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vokabeln;
    return vokabeln.filter((v) =>
      v.grundform.toLowerCase().includes(q) ||
      v.bedeutung.toLowerCase().includes(q)
    );
  }, [query, vokabeln]);

  return (
    <>
      {/* Search input */}
      <div className="relative mb-5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Wort oder Bedeutung suchen…"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Results */}
      {gefiltert.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">🔎</p>
          <p className="text-sm">Kein Treffer für „{query}"</p>
        </div>
      ) : (
        <>
          {query && (
            <p className="text-xs text-gray-400 mb-3">
              {gefiltert.length} Ergebnis{gefiltert.length !== 1 ? "se" : ""} für „{query}"
            </p>
          )}
          <div className="space-y-3">
            {gefiltert.map((v) => (
              <VokabelCard key={v.id} vokabel={v} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

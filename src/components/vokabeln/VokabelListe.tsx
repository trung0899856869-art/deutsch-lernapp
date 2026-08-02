"use client";

import { useState, useMemo } from "react";
import { VokabelCard } from "./VokabelCard";
import { WORTART_COLORS, type Wortart } from "@/lib/constants";

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

const TAB_COLORS: Record<Wortart, string> = {
  Substantiv: "border-blue-500 text-blue-700 bg-blue-50",
  Verb:       "border-red-500 text-red-700 bg-red-50",
  Adjektiv:   "border-yellow-500 text-yellow-700 bg-yellow-50",
  Adverb:     "border-purple-500 text-purple-700 bg-purple-50",
  Präposition:"border-orange-500 text-orange-700 bg-orange-50",
  Phrase:     "border-green-500 text-green-700 bg-green-50",
};

export function VokabelListe({ vokabeln }: { vokabeln: Vokabel[] }) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"Alle" | Wortart>("Alle");

  // Wortarten that actually have entries
  const availableTabs = useMemo(() => {
    const found = new Set(vokabeln.map((v) => v.wortart as Wortart));
    return (Object.keys(WORTART_COLORS) as Wortart[]).filter((w) => found.has(w));
  }, [vokabeln]);

  // Count per wortart for tab badges
  const countByWortart = useMemo(() => {
    const m: Record<string, number> = {};
    for (const v of vokabeln) m[v.wortart] = (m[v.wortart] ?? 0) + 1;
    return m;
  }, [vokabeln]);

  const gefiltert = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vokabeln.filter((v) => {
      const matchTab = activeTab === "Alle" || v.wortart === activeTab;
      const matchQ =
        !q ||
        v.grundform.toLowerCase().includes(q) ||
        v.bedeutung.toLowerCase().includes(q);
      return matchTab && matchQ;
    });
  }, [query, vokabeln, activeTab]);

  return (
    <>
      {/* Wortart tabs */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        <button
          onClick={() => setActiveTab("Alle")}
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
            activeTab === "Alle"
              ? "border-gray-700 bg-gray-700 text-white"
              : "border-gray-300 text-gray-500 hover:border-gray-400"
          }`}
        >
          Alle <span className="opacity-70 text-xs">({vokabeln.length})</span>
        </button>
        {availableTabs.map((wortart) => (
          <button
            key={wortart}
            onClick={() => setActiveTab(wortart)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              activeTab === wortart
                ? TAB_COLORS[wortart] + " border-2"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {wortart}{" "}
            <span className="opacity-70 text-xs">({countByWortart[wortart] ?? 0})</span>
          </button>
        ))}
      </div>

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
          <p className="text-sm">
            {query ? `Kein Treffer für „${query}"` : "Keine Einträge"}
          </p>
        </div>
      ) : (
        <>
          {(query || activeTab !== "Alle") && (
            <p className="text-xs text-gray-400 mb-3">
              {gefiltert.length} Wort{gefiltert.length !== 1 ? "er" : ""}
              {activeTab !== "Alle" ? ` · ${activeTab}` : ""}
              {query ? ` · „${query}"` : ""}
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

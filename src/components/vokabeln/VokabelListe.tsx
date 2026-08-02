"use client";

import { useState, useMemo } from "react";
import { VokabelCard } from "./VokabelCard";
import { WORTART_COLORS, type Wortart } from "@/lib/constants";
import { deleteVokabel } from "@/lib/actions/vokabeln";
import { speakGerman } from "@/lib/tts";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

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
  Substantiv:  "border-blue-500 text-blue-700 bg-blue-50",
  Verb:        "border-red-500 text-red-700 bg-red-50",
  Adjektiv:    "border-yellow-500 text-yellow-700 bg-yellow-50",
  Adverb:      "border-purple-500 text-purple-700 bg-purple-50",
  Präposition: "border-orange-500 text-orange-700 bg-orange-50",
  Phrase:      "border-green-500 text-green-700 bg-green-50",
};

type ViewMode = "card" | "compact";

export function VokabelListe({ vokabeln }: { vokabeln: Vokabel[] }) {
  const [query, setQuery]       = useState("");
  const [activeTab, setActiveTab] = useState<"Alle" | Wortart>("Alle");
  const [view, setView]         = useState<ViewMode>("compact");

  const availableTabs = useMemo(() => {
    const found = new Set(vokabeln.map((v) => v.wortart as Wortart));
    return (Object.keys(WORTART_COLORS) as Wortart[]).filter((w) => found.has(w));
  }, [vokabeln]);

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

      {/* Search + view toggle */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
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
            >×</button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden shrink-0">
          <button
            onClick={() => setView("compact")}
            title="Kompakt"
            className={`px-3 py-2 text-sm transition-colors ${
              view === "compact" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-600"
            }`}
          >☰</button>
          <button
            onClick={() => setView("card")}
            title="Karten"
            className={`px-3 py-2 text-sm transition-colors ${
              view === "card" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-600"
            }`}
          >⊞</button>
        </div>
      </div>

      {/* Results count */}
      {(query || activeTab !== "Alle") && gefiltert.length > 0 && (
        <p className="text-xs text-gray-400 mb-3">
          {gefiltert.length} Wort{gefiltert.length !== 1 ? "er" : ""}
          {activeTab !== "Alle" ? ` · ${activeTab}` : ""}
          {query ? ` · „${query}"` : ""}
        </p>
      )}

      {/* Empty state */}
      {gefiltert.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">🔎</p>
          <p className="text-sm">
            {query ? `Kein Treffer für „${query}"` : "Keine Einträge"}
          </p>
        </div>
      ) : view === "card" ? (
        <div className="space-y-3">
          {gefiltert.map((v) => (
            <VokabelCard key={v.id} vokabel={v} />
          ))}
        </div>
      ) : (
        <CompactList vokabeln={gefiltert} />
      )}
    </>
  );
}

function CompactList({ vokabeln }: { vokabeln: Vokabel[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
      {vokabeln.map((v) => (
        <CompactRow key={v.id} vokabel={v} />
      ))}
    </div>
  );
}

function CompactRow({ vokabel }: { vokabel: Vokabel }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const wortart = vokabel.wortart as Wortart;
  const colors = WORTART_COLORS[wortart];

  const displayWord =
    wortart === "Substantiv" && vokabel.artikel
      ? `${vokabel.artikel} ${vokabel.grundform}`
      : vokabel.grundform;

  function handleDelete() {
    startTransition(async () => {
      await deleteVokabel(vokabel.id);
    });
  }

  return (
    <div>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Wortart color dot */}
        <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />

        {/* Word */}
        <span className="font-medium text-gray-900 text-sm min-w-0 flex-1 truncate">
          {displayWord}
        </span>

        {/* Meaning */}
        <span className="text-sm text-gray-500 min-w-0 flex-1 truncate hidden sm:block">
          {vokabel.bedeutung}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => speakGerman(displayWord)}
            className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors text-xs"
          >🔊</button>
          {confirmDelete ? (
            <>
              <button
                onClick={handleDelete}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >✓</button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
              >✕</button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push(`/vokabeln/${vokabel.id}/bearbeiten`)}
                className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors text-xs"
              >✏️</button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors text-xs"
              >🗑️</button>
            </>
          )}
        </div>

        <span className="text-gray-400 text-xs shrink-0">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-3 text-sm text-gray-600 bg-gray-50 border-t border-gray-100">
          <p className="text-gray-500 sm:hidden mb-1">{vokabel.bedeutung}</p>
          {vokabel.pluralForm && (
            <p className="text-xs text-gray-400">Pl: die {vokabel.pluralForm}</p>
          )}
          {vokabel.partizip2 && (
            <p className="text-xs text-gray-400">
              {[vokabel.partizip2, vokabel.hilfsverb, vokabel.praesensEr && `er: ${vokabel.praesensEr}`].filter(Boolean).join(" · ")}
            </p>
          )}
          {vokabel.beispiel && (
            <p className="text-xs text-gray-500 mt-1 italic">„{vokabel.beispiel}"</p>
          )}
          {vokabel.tags && vokabel.tags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {vokabel.tags.map((t) => (
                <span key={t} className="text-xs bg-gray-200 text-gray-500 rounded px-1.5 py-0.5">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { VokabelCard } from "./VokabelCard";
import { VokabelDetailPanel } from "./VokabelDetailPanel";
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
  const [query, setQuery]         = useState("");
  const [activeTab, setActiveTab] = useState<"Alle" | Wortart>("Alle");
  const [view, setView]           = useState<ViewMode>("compact");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
      const matchQ   = !q || v.grundform.toLowerCase().includes(q) || v.bedeutung.toLowerCase().includes(q);
      return matchTab && matchQ;
    });
  }, [query, vokabeln, activeTab]);

  const selectedVokabel = useMemo(
    () => vokabeln.find((v) => v.id === selectedId) ?? null,
    [vokabeln, selectedId]
  );

  const filterBar = (
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
            {wortart} <span className="opacity-70 text-xs">({countByWortart[wortart] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Search + view toggle */}
      <div className="flex gap-2 mb-4">
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
        <div className="flex rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden shrink-0">
          <button
            onClick={() => setView("compact")}
            title="Kompakt"
            className={`px-3 py-2 text-sm transition-colors ${view === "compact" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-600"}`}
          >☰</button>
          <button
            onClick={() => setView("card")}
            title="Karten"
            className={`px-3 py-2 text-sm transition-colors ${view === "card" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-600"}`}
          >⊞</button>
        </div>
      </div>

      {(query || activeTab !== "Alle") && gefiltert.length > 0 && (
        <p className="text-xs text-gray-400 mb-3">
          {gefiltert.length} Wort{gefiltert.length !== 1 ? "er" : ""}
          {activeTab !== "Alle" ? ` · ${activeTab}` : ""}
          {query ? ` · „${query}"` : ""}
        </p>
      )}
    </>
  );

  const listContent = gefiltert.length === 0 ? (
    <div className="text-center py-10 text-gray-400">
      <p className="text-3xl mb-2">🔎</p>
      <p className="text-sm">{query ? `Kein Treffer für „${query}"` : "Keine Einträge"}</p>
    </div>
  ) : view === "card" ? (
    <div className="space-y-3">
      {gefiltert.map((v) => <VokabelCard key={v.id} vokabel={v} />)}
    </div>
  ) : (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
      {gefiltert.map((v) => (
        <CompactRow
          key={v.id}
          vokabel={v}
          selected={selectedId === v.id}
          onSelect={() => setSelectedId(v.id === selectedId ? null : v.id)}
        />
      ))}
    </div>
  );

  return (
    <>
      {/* ── Mobile: single column ── */}
      <div className="md:hidden">
        {filterBar}
        {listContent}
      </div>

      {/* ── Desktop: master-detail ── */}
      <div className="hidden md:flex md:gap-6 md:items-start">
        {/* Left panel — list */}
        <div className="w-96 flex-shrink-0">
          {filterBar}
          {listContent}
        </div>

        {/* Right panel — detail (sticky) */}
        <div className="flex-1 sticky top-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
          {selectedVokabel ? (
            <VokabelDetailPanel key={selectedVokabel.id} vokabel={selectedVokabel} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-3xl mb-2">👈</p>
              <p className="text-sm">Wort aus der Liste auswählen</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Compact row ─────────────────────────────────────────────────────────────

function CompactRow({
  vokabel,
  selected,
  onSelect,
}: {
  vokabel: Vokabel;
  selected: boolean;
  onSelect: () => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Mobile: expand inline; desktop: handled by detail panel
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const wortart = vokabel.wortart as Wortart;
  const colors = WORTART_COLORS[wortart];

  const displayWord =
    wortart === "Substantiv" && vokabel.artikel
      ? `${vokabel.artikel} ${vokabel.grundform}`
      : vokabel.grundform;

  function handleDelete() {
    startTransition(async () => { await deleteVokabel(vokabel.id); });
  }

  function handleRowClick() {
    // Desktop: select for detail panel (handled via onSelect)
    // Mobile: toggle inline expand
    onSelect();
    setMobileExpanded((e) => !e);
  }

  return (
    <div className={selected ? "bg-blue-50" : ""}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleRowClick}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
        <span className="font-medium text-gray-900 text-sm min-w-0 flex-1 truncate">{displayWord}</span>
        <span className="text-sm text-gray-500 min-w-0 flex-1 truncate hidden sm:block">{vokabel.bedeutung}</span>

        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => speakGerman(displayWord)}
            className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors text-xs"
          >🔊</button>
          {confirmDelete ? (
            <>
              <button onClick={handleDelete} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">✓</button>
              <button onClick={() => setConfirmDelete(false)} className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700">✕</button>
            </>
          ) : (
            <>
              <button onClick={() => router.push(`/vokabeln/${vokabel.id}/bearbeiten`)} className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors text-xs">✏️</button>
              <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors text-xs">🗑️</button>
            </>
          )}
        </div>

        {/* Chevron — mobile only */}
        <span className="text-gray-400 text-xs shrink-0 md:hidden">{mobileExpanded ? "▲" : "▼"}</span>
      </div>

      {/* Mobile inline expand */}
      {mobileExpanded && (
        <div className="md:hidden px-4 pb-3 text-sm text-gray-600 bg-gray-50 border-t border-gray-100">
          <p className="text-gray-500 mb-1">{vokabel.bedeutung}</p>
          {vokabel.pluralForm && <p className="text-xs text-gray-400">Pl: die {vokabel.pluralForm}</p>}
          {vokabel.partizip2 && (
            <p className="text-xs text-gray-400">
              {[vokabel.partizip2, vokabel.hilfsverb, vokabel.praesensEr && `er: ${vokabel.praesensEr}`].filter(Boolean).join(" · ")}
            </p>
          )}
          {vokabel.beispiel && <p className="text-xs text-gray-500 mt-1 italic">„{vokabel.beispiel}"</p>}
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

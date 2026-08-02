"use client";

import { useState, useMemo, memo } from "react";
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
  praesensIch?: string | null;
  praesensDu?: string | null;
  praesensEr?: string | null;
  praesensWir?: string | null;
  praesensIhr?: string | null;
  praesensSie?: string | null;
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

type ViewMode = "compact" | "table" | "card";

export function VokabelListe({ vokabeln }: { vokabeln: Vokabel[] }) {
  const [query, setQuery]           = useState("");
  const [activeTab, setActiveTab]   = useState<"Alle" | Wortart>("Alle");
  const [view, setView]             = useState<ViewMode>("compact");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage]             = useState(1);

  const PAGE_SIZE = 50;

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

  const totalPages = Math.max(1, Math.ceil(gefiltert.length / PAGE_SIZE));

  const paged = useMemo(
    () => gefiltert.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [gefiltert, page, PAGE_SIZE]
  );

  // Reset to page 1 when filter changes
  const setFilter = (fn: () => void) => { fn(); setPage(1); };

  const selectedVokabel = useMemo(
    () => vokabeln.find((v) => v.id === selectedId) ?? null,
    [vokabeln, selectedId]
  );

  return (
    // Single render — CSS grid handles desktop 2-col, mobile single-col
    <div className="md:grid md:grid-cols-[384px_1fr] md:gap-6 md:items-start">

      {/* ── Left / full-width column ── */}
      <div>
        {/* Wortart tabs */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          <button
            onClick={() => setFilter(() => setActiveTab("Alle"))}
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
              onClick={() => setFilter(() => setActiveTab(wortart))}
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
              onChange={(e) => setFilter(() => setQuery(e.target.value))}
              placeholder="Wort oder Bedeutung suchen…"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            {query && (
              <button
                onClick={() => setFilter(() => setQuery(""))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              >×</button>
            )}
          </div>
          {/* 3 view modes */}
          <div className="flex rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden shrink-0 text-sm">
            <button onClick={() => setView("compact")} title="Kompakt"
              className={`px-2.5 py-2 transition-colors ${view === "compact" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-600"}`}
            >☰</button>
            <button onClick={() => setView("table")} title="Tabelle"
              className={`px-2.5 py-2 transition-colors border-x border-gray-200 ${view === "table" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-600"}`}
            >⊟</button>
            <button onClick={() => setView("card")} title="Karten"
              className={`px-2.5 py-2 transition-colors ${view === "card" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-600"}`}
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

        {/* List content */}
        {gefiltert.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">🔎</p>
            <p className="text-sm">{query ? `Kein Treffer für „${query}"` : "Keine Einträge"}</p>
          </div>
        ) : view === "card" ? (
          <div className="space-y-3">
            {paged.map((v) => <VokabelCard key={v.id} vokabel={v} />)}
          </div>
        ) : view === "table" ? (
          <TableView vokabeln={paged} selectedId={selectedId} onSelect={setSelectedId} />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {paged.map((v) => (
              <CompactRow
                key={v.id}
                vokabel={v}
                selected={selectedId === v.id}
                onSelect={() => setSelectedId(v.id === selectedId ? null : v.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <span className="text-gray-500 text-xs">
              Seite {page} / {totalPages}
              <span className="text-gray-400 ml-1">
                ({(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, gefiltert.length)} von {gefiltert.length})
              </span>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Right column: detail panel (desktop only) ── */}
      <div className="hidden md:block sticky top-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
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
  );
}

// ── Table view ───────────────────────────────────────────────────────────────

function TableView({
  vokabeln,
  selectedId,
  onSelect,
}: {
  vokabeln: Vokabel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide w-4"></th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Wort</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Bedeutung</th>
            <th className="text-left px-3 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Formen</th>
            <th className="px-3 py-2.5 w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {vokabeln.map((v) => (
            <TableRow
              key={v.id}
              vokabel={v}
              selected={selectedId === v.id}
              onSelect={() => onSelect(v.id === selectedId ? "" : v.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TableRow = memo(function TableRow({
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
  const wortart = vokabel.wortart as Wortart;
  const colors = WORTART_COLORS[wortart];

  const displayWord =
    wortart === "Substantiv" && vokabel.artikel
      ? `${vokabel.artikel} ${vokabel.grundform}`
      : vokabel.grundform;

  const formenText = (() => {
    if (wortart === "Substantiv" && vokabel.pluralForm) return `Pl: ${vokabel.pluralForm}`;
    if (wortart === "Verb") return [vokabel.partizip2, vokabel.hilfsverb].filter(Boolean).join(" ");
    if (wortart === "Adjektiv") return [vokabel.komparativ, vokabel.superlativ].filter(Boolean).join(" · ");
    return "";
  })();

  function handleDelete() {
    startTransition(async () => { await deleteVokabel(vokabel.id); });
  }

  return (
    <tr
      className={`cursor-pointer transition-colors ${selected ? "bg-blue-50" : "hover:bg-gray-50"}`}
      onClick={onSelect}
    >
      <td className="px-3 py-2.5">
        <span className={`inline-block w-2 h-2 rounded-full ${colors.dot}`} />
      </td>
      <td className="px-3 py-2.5">
        <span className="font-medium text-gray-900">{displayWord}</span>
      </td>
      <td className="px-3 py-2.5 text-gray-500 hidden sm:table-cell max-w-[180px] truncate">
        {vokabel.bedeutung}
      </td>
      <td className="px-3 py-2.5 text-gray-400 text-xs hidden md:table-cell">
        {formenText}
      </td>
      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-0.5 justify-end">
          <button onClick={() => speakGerman(displayWord)} className="p-1 text-gray-300 hover:text-blue-500 text-xs">🔊</button>
          {confirmDelete ? (
            <>
              <button onClick={handleDelete} className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded">✓</button>
              <button onClick={() => setConfirmDelete(false)} className="px-1.5 py-0.5 text-xs text-gray-500">✕</button>
            </>
          ) : (
            <>
              <button onClick={() => router.push(`/vokabeln/${vokabel.id}/bearbeiten`)} className="p-1 text-gray-300 hover:text-blue-500 text-xs">✏️</button>
              <button onClick={() => setConfirmDelete(true)} className="p-1 text-gray-300 hover:text-red-500 text-xs">🗑️</button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
});

// ── Compact row ──────────────────────────────────────────────────────────────

const CompactRow = memo(function CompactRow({
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
          <button onClick={() => speakGerman(displayWord)} className="p-1.5 text-gray-300 hover:text-blue-500 text-xs">🔊</button>
          {confirmDelete ? (
            <>
              <button onClick={handleDelete} className="px-2 py-1 text-xs bg-red-500 text-white rounded">✓</button>
              <button onClick={() => setConfirmDelete(false)} className="px-2 py-1 text-xs text-gray-500">✕</button>
            </>
          ) : (
            <>
              <button onClick={() => router.push(`/vokabeln/${vokabel.id}/bearbeiten`)} className="p-1.5 text-gray-300 hover:text-blue-500 text-xs">✏️</button>
              <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-gray-300 hover:text-red-500 text-xs">🗑️</button>
            </>
          )}
        </div>
        <span className="text-gray-400 text-xs shrink-0 md:hidden">{mobileExpanded ? "▲" : "▼"}</span>
      </div>

      {/* Mobile inline expand */}
      {mobileExpanded && (
        <div className="md:hidden px-4 pb-3 text-sm bg-gray-50 border-t border-gray-100">
          <p className="text-gray-500 mb-1">{vokabel.bedeutung}</p>
          {wortart === "Substantiv" && vokabel.pluralForm && (
            <p className="text-xs text-gray-400">Pl: die {vokabel.pluralForm}</p>
          )}
          {wortart === "Verb" && (
            <div className="text-xs text-gray-400 space-y-0.5 mt-0.5">
              {vokabel.partizip2 && (
                <p>{vokabel.partizip2} ({vokabel.hilfsverb ?? "haben"}){vokabel.praeteritum ? ` · ich ${vokabel.praeteritum}` : ""}</p>
              )}
              {(vokabel.praesensEr || vokabel.praesensIch) && (
                <p>
                  {[
                    vokabel.praesensIch && `ich ${vokabel.praesensIch}`,
                    vokabel.praesensDu && `du ${vokabel.praesensDu}`,
                    vokabel.praesensEr && `er ${vokabel.praesensEr}`,
                  ].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          )}
          {wortart === "Adjektiv" && (vokabel.komparativ || vokabel.superlativ) && (
            <p className="text-xs text-gray-400">{[vokabel.komparativ, vokabel.superlativ].filter(Boolean).join(" · ")}</p>
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
});

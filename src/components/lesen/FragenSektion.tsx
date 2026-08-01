"use client";

import { useState, useTransition } from "react";
import { createLesenFrage, deleteLesenFrage } from "@/lib/actions/lesen";

interface Frage {
  id: string;
  frage: string;
  antwort: string;
  textId: string;
}

interface Props {
  textId: string;
  fragen: Frage[];
}

export function FragenSektion({ textId, fragen }: Props) {
  const [pending, startTransition] = useTransition();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [neueFrage, setNeueFrage] = useState("");
  const [neueAntwort, setNeueAntwort] = useState("");

  function toggleReveal(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleAdd() {
    if (!neueFrage.trim() || !neueAntwort.trim()) return;
    startTransition(async () => {
      await createLesenFrage({
        textId,
        frage: neueFrage.trim(),
        antwort: neueAntwort.trim(),
        sortOrder: fragen.length,
      });
      setNeueFrage("");
      setNeueAntwort("");
      setAdding(false);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Frage löschen?")) return;
    startTransition(async () => {
      await deleteLesenFrage(id, textId);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800">Verständnisfragen</h2>
        <button
          onClick={() => setAdding(!adding)}
          className="text-sm text-blue-600 hover:underline"
        >
          {adding ? "Abbrechen" : "+ Frage hinzufügen"}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg space-y-2">
          <input
            value={neueFrage}
            onChange={(e) => setNeueFrage(e.target.value)}
            placeholder="Frage eingeben..."
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={neueAntwort}
            onChange={(e) => setNeueAntwort(e.target.value)}
            placeholder="Antwort eingeben..."
            rows={2}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            disabled={pending}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {pending ? "Speichern..." : "Hinzufügen"}
          </button>
        </div>
      )}

      {/* Question list */}
      {fragen.length === 0 && !adding ? (
        <p className="text-sm text-gray-400">Noch keine Fragen hinzugefügt.</p>
      ) : (
        <div className="space-y-3">
          {fragen.map((f, i) => (
            <div key={f.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleReveal(f.id)}
                className="w-full flex items-start gap-3 p-3 text-left hover:bg-gray-50"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-800">{f.frage}</span>
                <span className="ml-auto text-gray-400 shrink-0">
                  {revealed.has(f.id) ? "▲" : "▼"}
                </span>
              </button>
              {revealed.has(f.id) && (
                <div className="border-t border-gray-100 px-3 pb-3 pt-2">
                  <p className="text-sm text-gray-700">{f.antwort}</p>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="mt-2 text-xs text-red-400 hover:underline"
                  >
                    Löschen
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

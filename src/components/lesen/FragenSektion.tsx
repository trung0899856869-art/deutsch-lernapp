"use client";

import { useState, useTransition } from "react";
import { deleteLesenFrage } from "@/lib/actions/lesen";

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
  const [, startTransition] = useTransition();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  function toggleReveal(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Frage löschen?")) return;
    startTransition(async () => {
      await deleteLesenFrage(id, textId);
    });
  }

  if (fragen.length === 0) return null;

  return (
    <div>
      <h2 className="font-semibold text-gray-800 mb-3">Verständnisfragen</h2>
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
    </div>
  );
}

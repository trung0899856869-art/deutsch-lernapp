"use client";

import { useState, useTransition } from "react";
import { computeNextSrs, type SrsState } from "@/lib/srs";
import { updateGrammatikSrs } from "@/lib/actions/grammatik";

interface DueCard {
  id: string;
  kategorie: string;
  titel: string;
  inhalt: string;
  beispiele?: string | null;
  notes?: string | null;
  srsId?: string | null;
  interval?: number | null;
  repetition?: number | null;
  efactor?: number | null;
  dueDate?: string | null;
}

type Quality = 0 | 3 | 5;

const BUTTONS: { label: string; q: Quality; cls: string }[] = [
  { label: "Nochmal", q: 0, cls: "bg-red-500 hover:bg-red-600" },
  { label: "Gut", q: 3, cls: "bg-green-500 hover:bg-green-600" },
  { label: "Perfekt", q: 5, cls: "bg-emerald-600 hover:bg-emerald-700" },
];

export function GrammatikFlashcard({ cards }: { cards: DueCard[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setReveal] = useState(false);
  const [done, setDone] = useState(false);
  const [, startTransition] = useTransition();

  if (done || cards.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-xl font-semibold text-gray-800">
          {cards.length === 0 ? "Keine Karten fällig!" : "Alle Karten erledigt!"}
        </h2>
        <p className="text-gray-500 mt-2">
          {cards.length === 0
            ? "Alle Grammatikregeln gelernt. Schau morgen wieder vorbei."
            : `Du hast ${cards.length} Karten wiederholt.`}
        </p>
      </div>
    );
  }

  const card = cards[index];

  function handleQuality(q: Quality) {
    const currentState: SrsState = {
      interval: card.interval ?? 1,
      repetition: card.repetition ?? 0,
      efactor: card.efactor ?? 2.5,
      dueDate: card.dueDate ?? new Date().toISOString().split("T")[0],
    };
    const next = computeNextSrs(currentState, q);

    setReveal(false);
    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex(index + 1);
    }
    startTransition(() => {
      updateGrammatikSrs(card.id, card.srsId ?? null, next);
    });
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
        <span>{index + 1} / {cards.length}</span>
        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-green-500 h-1.5 rounded-full transition-all"
            style={{ width: `${((index + 1) / cards.length) * 100}%` }}
          />
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
          {card.kategorie}
        </span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Front */}
        <div className="p-8 text-center">
          <p className="text-xl font-semibold text-gray-900 leading-relaxed">
            {card.titel}
          </p>
        </div>

        {/* Reveal / Back */}
        {!revealed ? (
          <div className="px-8 pb-8">
            <button
              onClick={() => setReveal(true)}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Antwort anzeigen
            </button>
          </div>
        ) : (
          <>
            <div className="border-t border-gray-100 bg-gray-50 px-8 py-6">
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {card.inhalt}
              </p>

              {card.beispiele && (
                <div className="mt-4 space-y-1.5">
                  {card.beispiele.split("\n").filter(Boolean).map((line, i) => (
                    <p key={i} className="text-sm text-gray-600 border-l-2 border-green-300 pl-3 italic">
                      „{line}"
                    </p>
                  ))}
                </div>
              )}

              {card.notes && (
                <p className="mt-3 text-xs text-gray-400 italic">{card.notes}</p>
              )}
            </div>

            {/* Quality buttons */}
            <div className="px-6 pb-6 pt-4">
              <p className="text-center text-xs text-gray-400 mb-3">Wie gut wusstest du es?</p>
              <div className="grid grid-cols-3 gap-3">
                {BUTTONS.map(({ label, q, cls }) => (
                  <button
                    key={q}
                    onClick={() => handleQuality(q)}
                    className={`py-2.5 rounded-lg text-white text-sm font-medium transition-colors ${cls}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

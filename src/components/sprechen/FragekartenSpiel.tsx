"use client";

import { useState } from "react";
import { SttButton } from "./SttButton";

interface Fragekarte {
  id: string;
  thema: string;
  vokabelHinweis?: string | null;
  musterfrage?: string | null;
  musterantwort?: string | null;
  notes?: string | null;
}

interface Props {
  karten: Fragekarte[];
}

export function FragekartenSpiel({ karten }: Props) {
  const [shuffled, setShuffled] = useState(() => shuffle([...karten]));
  const [index, setIndex] = useState(0);
  const [revealed, setReveal] = useState(false);
  const [transcript, setTranscript] = useState("");

  function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function handleNext() {
    setReveal(false);
    setTranscript("");
    setIndex((prev) => (prev + 1) % shuffled.length);
  }

  function handleShuffle() {
    setShuffled(shuffle([...karten]));
    setIndex(0);
    setReveal(false);
    setTranscript("");
  }

  if (karten.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">🃏</p>
        <p>Noch keine Karten. Füge deine erste Fragekarte hinzu!</p>
      </div>
    );
  }

  const karte = shuffled[index];

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
        <span>Karte {index + 1} / {shuffled.length}</span>
        <button
          onClick={handleShuffle}
          className="text-blue-600 hover:underline text-sm"
        >
          🔀 Neu mischen
        </button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
        {/* Thema + Vokabel hint */}
        <div className="p-8 text-center">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
            Thema
          </p>
          <p className="text-2xl font-bold text-gray-900">{karte.thema}</p>
          {karte.vokabelHinweis && (
            <p className="mt-2 text-gray-500">
              Vokabular: <span className="font-medium text-gray-700">{karte.vokabelHinweis}</span>
            </p>
          )}
          <p className="mt-4 text-sm text-gray-400 italic">
            Stelle eine Frage und beantworte sie!
          </p>
        </div>

        {/* Reveal musterfrage/antwort */}
        {!revealed ? (
          <div className="px-8 pb-8 text-center">
            <button
              onClick={() => setReveal(true)}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
            >
              Beispiel anzeigen
            </button>
          </div>
        ) : (
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 space-y-2">
            {karte.musterfrage && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Musterfrage:</span>
                <p className="text-gray-800">{karte.musterfrage}</p>
              </div>
            )}
            {karte.musterantwort && (
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Musterantwort:</span>
                <p className="text-gray-800">{karte.musterantwort}</p>
              </div>
            )}
            {karte.notes && <p className="text-sm text-gray-500 italic">{karte.notes}</p>}
          </div>
        )}
      </div>

      {/* STT */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Deine Antwort (sprechen):</span>
          <SttButton onResult={setTranscript} />
        </div>
        {transcript && (
          <p className="text-sm text-gray-800 bg-blue-50 rounded-lg px-3 py-2 mt-2">
            {transcript}
          </p>
        )}
      </div>

      <button
        onClick={handleNext}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        Nächste Karte →
      </button>
    </div>
  );
}

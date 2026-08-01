"use client";

import { useState } from "react";
import { SttButton } from "./SttButton";

interface Zeile {
  sprecher: string;
  text: string;
}

interface Props {
  titel: string;
  zeilen: Zeile[];
  notes?: string | null;
}

export function DialogPlayer({ titel, zeilen, notes }: Props) {
  const [myTranscript, setTranscript] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Get unique speakers to let user pick their role
  const speakers = Array.from(new Set(zeilen.map((z) => z.sprecher)));
  const [myRole, setMyRole] = useState(speakers[0] ?? "A");

  return (
    <div>
      {/* Role picker */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600 font-medium">Meine Rolle:</span>
        {speakers.map((s) => (
          <button
            key={s}
            onClick={() => setMyRole(s)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              myRole === s
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Dialog */}
      <div className="space-y-3 mb-6">
        {zeilen.map((zeile, i) => {
          const isMyTurn = zeile.sprecher === myRole;
          return (
            <div
              key={i}
              onClick={() => setActiveIndex(activeIndex === i ? null : i)}
              className={`flex gap-3 cursor-pointer ${isMyTurn ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isMyTurn ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {zeile.sprecher.slice(0, 1)}
              </div>
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                  isMyTurn
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-gray-100 text-gray-800 rounded-tl-none"
                }`}
              >
                {activeIndex === i || !isMyTurn ? (
                  <span>{zeile.text}</span>
                ) : (
                  <span className="opacity-40 italic">Zeile anzeigen...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* STT Practice */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sprechen üben</h3>
        <SttButton onResult={(t) => setTranscript(t)} />
        {myTranscript && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-800">{myTranscript}</p>
            <button
              onClick={() => setTranscript("")}
              className="mt-1 text-xs text-gray-400 hover:text-gray-600"
            >
              Zurücksetzen
            </button>
          </div>
        )}
      </div>

      {notes && (
        <p className="mt-4 text-sm text-gray-500 italic">{notes}</p>
      )}
    </div>
  );
}

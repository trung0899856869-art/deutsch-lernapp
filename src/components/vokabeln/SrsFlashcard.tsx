"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { computeNextSrs, type Quality, type SrsState } from "@/lib/srs";
import { updateSrs } from "@/lib/actions/vokabeln";
import { WortartBadge } from "./WortartBadge";
import type { Wortart } from "@/lib/constants";

interface DueCard {
  id: string;
  wortart: string;
  grundform: string;
  bedeutung: string;
  artikel?: string | null;
  pluralForm?: string | null;
  partizip2?: string | null;
  hilfsverb?: string | null;
  praesensEr?: string | null;
  praeteritum?: string | null;
  komparativ?: string | null;
  superlativ?: string | null;
  beispiel?: string | null;
  notes?: string | null;
  srsId?: string | null;
  interval?: number | null;
  repetition?: number | null;
  efactor?: number | null;
  dueDate?: string | null;
}

const QUALITY_LABELS: Record<Quality, string> = {
  0: "Keine Ahnung",
  1: "Fast",
  2: "Schwer",
  3: "Gut",
  4: "Einfach",
  5: "Perfekt",
};

const QUALITY_COLORS: Record<Quality, string> = {
  0: "bg-red-500 hover:bg-red-600",
  1: "bg-red-400 hover:bg-red-500",
  2: "bg-orange-400 hover:bg-orange-500",
  3: "bg-green-400 hover:bg-green-500",
  4: "bg-green-500 hover:bg-green-600",
  5: "bg-emerald-600 hover:bg-emerald-700",
};

const TIMER_SECONDS = 10;
const RING_RADIUS = 18;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function SrsFlashcard({ cards }: { cards: DueCard[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setReveal] = useState(false);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [pending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const card = cards[index];

  // Start countdown on new card; pause when revealed or done
  useEffect(() => {
    if (done || revealed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index, revealed, done]);

  // Auto-skip as "Keine Ahnung" when time runs out
  useEffect(() => {
    if (timeLeft <= 0 && !revealed && !done) {
      handleQuality(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  if (done || cards.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-xl font-semibold text-gray-800">
          {cards.length === 0 ? "Keine Karten fällig!" : "Alle Karten erledigt!"}
        </h2>
        <p className="text-gray-500 mt-2">
          {cards.length === 0
            ? "Du hast alle Vokabeln gelernt. Schau morgen wieder vorbei."
            : `Du hast ${cards.length} Karten wiederholt.`}
        </p>
      </div>
    );
  }

  function handleQuality(q: Quality) {
    if (!card.srsId || pending) return;
    const currentState: SrsState = {
      interval: card.interval ?? 1,
      repetition: card.repetition ?? 0,
      efactor: card.efactor ?? 2.5,
      dueDate: card.dueDate ?? new Date().toISOString().split("T")[0],
    };
    const next = computeNextSrs(currentState, q);

    startTransition(async () => {
      await updateSrs(card.srsId!, next);
      setReveal(false);
      if (index + 1 >= cards.length) {
        setDone(true);
      } else {
        setIndex(index + 1);
      }
    });
  }

  function handleReveal() {
    if (timerRef.current) clearInterval(timerRef.current);
    setReveal(true);
  }

  const wortart = card.wortart as Wortart;

  // Ring color: green → orange → red
  const ringColor =
    timeLeft > 6 ? "#22c55e" : timeLeft > 3 ? "#f97316" : "#ef4444";
  const dashOffset = RING_CIRCUMFERENCE * (1 - timeLeft / TIMER_SECONDS);

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
        <span>{index + 1} / {cards.length}</span>
        <div className="flex-1 mx-4 bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all"
            style={{ width: `${(index / cards.length) * 100}%` }}
          />
        </div>
        <WortartBadge wortart={wortart} />
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Front */}
        <div className="p-8 text-center">
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {wortart === "Substantiv" && card.artikel
              ? `${card.artikel} ${card.grundform}`
              : card.grundform}
          </p>

          {wortart === "Substantiv" && card.pluralForm && (
            <p className="text-gray-500 text-sm">Plural: die {card.pluralForm}</p>
          )}
          {wortart === "Verb" && (
            <p className="text-gray-500 text-sm mt-1">
              {[card.partizip2, card.hilfsverb].filter(Boolean).join(", ")}
            </p>
          )}
          {wortart === "Adjektiv" && (card.komparativ || card.superlativ) && (
            <p className="text-gray-500 text-sm mt-1">
              {[card.komparativ, card.superlativ].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {/* Reveal area */}
        {!revealed ? (
          <div className="px-8 pb-8 flex flex-col items-center gap-4">
            {/* Countdown ring */}
            <div className="relative w-12 h-12">
              <svg width="48" height="48" className="-rotate-90">
                {/* Track */}
                <circle
                  cx="24" cy="24" r={RING_RADIUS}
                  fill="none" stroke="#e5e7eb" strokeWidth="3"
                />
                {/* Progress */}
                <circle
                  cx="24" cy="24" r={RING_RADIUS}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="3"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums"
                style={{ color: ringColor }}
              >
                {timeLeft}
              </span>
            </div>

            <button
              onClick={handleReveal}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Bedeutung anzeigen
            </button>
          </div>
        ) : (
          <>
            {/* Back */}
            <div className="border-t border-gray-100 bg-gray-50 px-8 py-6 text-center">
              <p className="text-2xl font-medium text-gray-800">{card.bedeutung}</p>
              {card.notes && (
                <p className="text-sm text-gray-500 mt-1 italic">{card.notes}</p>
              )}
              {card.beispiel && (
                <p className="text-sm text-gray-600 mt-2 border-l-2 border-gray-300 pl-3 text-left">
                  „{card.beispiel}"
                </p>
              )}
            </div>

            {/* Quality buttons */}
            <div className="px-4 pb-6">
              <p className="text-center text-xs text-gray-400 mb-3">Wie gut wusstest du es?</p>
              <div className="grid grid-cols-3 gap-2">
                {([0, 1, 2] as Quality[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuality(q)}
                    disabled={pending}
                    className={`py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 ${QUALITY_COLORS[q]}`}
                  >
                    {QUALITY_LABELS[q]}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {([3, 4, 5] as Quality[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuality(q)}
                    disabled={pending}
                    className={`py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 ${QUALITY_COLORS[q]}`}
                  >
                    {QUALITY_LABELS[q]}
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

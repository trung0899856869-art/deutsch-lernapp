"use client";

import { useState, useTransition } from "react";
import { createLesenFrage, deleteLesenFrage, generateLesenFragen } from "@/lib/actions/lesen";

interface Frage {
  id: string;
  frage: string;
  antwort: string;
  optionen?: string[] | null;
  korrektIndex?: number | null;
  aiGenerated?: number | null;
  textId: string;
}

interface Props {
  textId: string;
  fragen: Frage[];
  inhalt: string;
  niveau?: string | null;
}

export function FragenSektion({ textId, fragen, inhalt, niveau }: Props) {
  const [pending, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [adding, setAdding] = useState(false);
  const [neueFrage, setNeueFrage] = useState("");
  const [neueAntwort, setNeueAntwort] = useState("");
  const [generateError, setGenerateError] = useState<string | null>(null);

  const mcFragen = fragen.filter((f) => f.optionen && f.optionen.length > 0);
  const answeredCount = mcFragen.filter((f) => selectedAnswers[f.id] !== undefined).length;
  const correctCount = mcFragen.filter(
    (f) => selectedAnswers[f.id] !== undefined && selectedAnswers[f.id] === f.korrektIndex
  ).length;
  const allAnswered = mcFragen.length > 0 && answeredCount === mcFragen.length;

  function handleGenerate() {
    setGenerateError(null);
    setGenerating(true);
    setSelectedAnswers({});
    startTransition(async () => {
      try {
        await generateLesenFragen(textId, inhalt, niveau ?? "A2");
      } catch (e) {
        setGenerateError(e instanceof Error ? e.message : "Fehler beim Generieren");
      } finally {
        setGenerating(false);
      }
    });
  }

  function handleSelectOption(frageId: string, optionIndex: number) {
    setSelectedAnswers((prev) => {
      if (prev[frageId] !== undefined) return prev; // already answered
      return { ...prev, [frageId]: optionIndex };
    });
  }

  function toggleReveal(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleAddManual() {
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

  function resetQuiz() {
    setSelectedAnswers({});
  }

  const openFragen = fragen.filter((f) => !f.optionen || f.optionen.length === 0);

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">Verständnisfragen</h2>
        <div className="flex items-center gap-2">
          {allAnswered && (
            <button onClick={resetQuiz} className="text-xs text-gray-500 hover:text-gray-700 underline">
              Nochmal
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={pending || generating}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {generating ? (
              <>
                <span className="animate-spin text-xs">⟳</span>
                Generiere...
              </>
            ) : (
              <>✦ KI-Fragen</>
            )}
          </button>
          <button
            onClick={() => setAdding(!adding)}
            className="text-sm text-blue-600 hover:underline"
          >
            {adding ? "Abbrechen" : "+ Eigene"}
          </button>
        </div>
      </div>

      {generateError && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {generateError}
        </div>
      )}

      {/* Score summary */}
      {allAnswered && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <span className="text-2xl">
            {correctCount === mcFragen.length ? "🎉" : correctCount >= mcFragen.length / 2 ? "👍" : "📖"}
          </span>
          <div>
            <p className="font-semibold text-green-800">
              {correctCount} / {mcFragen.length} richtig
            </p>
            <p className="text-xs text-green-600">
              {correctCount === mcFragen.length
                ? "Perfekt! Alle Fragen richtig."
                : "Lies den Text nochmal und versuche es erneut."}
            </p>
          </div>
        </div>
      )}

      {/* Manual add form */}
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
            onClick={handleAddManual}
            disabled={pending}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {pending ? "Speichern..." : "Hinzufügen"}
          </button>
        </div>
      )}

      {/* Empty state */}
      {fragen.length === 0 && !adding && (
        <p className="text-sm text-gray-400">
          Noch keine Fragen. Klicke auf &quot;✦ KI-Fragen&quot;, um automatisch Fragen zu generieren.
        </p>
      )}

      {/* MC questions */}
      {mcFragen.length > 0 && (
        <div className="space-y-4 mb-4">
          {mcFragen.map((f, i) => (
            <MCFrage
              key={f.id}
              frage={f}
              index={i}
              selected={selectedAnswers[f.id]}
              onSelect={(idx) => handleSelectOption(f.id, idx)}
              onDelete={() => handleDelete(f.id)}
            />
          ))}
        </div>
      )}

      {/* Open-answer questions (manual) */}
      {openFragen.length > 0 && (
        <div className="space-y-3">
          {openFragen.map((f, i) => (
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

function MCFrage({
  frage,
  index,
  selected,
  onSelect,
  onDelete,
}: {
  frage: Frage;
  index: number;
  selected: number | undefined;
  onSelect: (i: number) => void;
  onDelete: () => void;
}) {
  const answered = selected !== undefined;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Question header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs flex items-center justify-center font-bold mt-0.5">
            {index + 1}
          </span>
          <p className="text-sm font-medium text-gray-800">{frage.frage}</p>
        </div>
        <button
          onClick={onDelete}
          className="text-gray-300 hover:text-red-400 transition-colors shrink-0 text-xs mt-0.5"
          title="Löschen"
        >
          ✕
        </button>
      </div>

      {/* Options */}
      <div className="p-3 space-y-2">
        {frage.optionen!.map((option, i) => {
          const isSelected = selected === i;
          const isCorrect = frage.korrektIndex === i;

          let btnClass =
            "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm text-left transition-colors ";
          if (!answered) {
            btnClass += "border-gray-200 hover:bg-violet-50 hover:border-violet-300 cursor-pointer text-gray-700";
          } else if (isCorrect) {
            btnClass += "border-green-400 bg-green-50 text-green-800 cursor-default";
          } else if (isSelected) {
            btnClass += "border-red-300 bg-red-50 text-red-700 cursor-default";
          } else {
            btnClass += "border-gray-100 text-gray-400 cursor-default";
          }

          let circlClass =
            "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ";
          if (!answered) {
            circlClass += "border-gray-300 text-gray-400";
          } else if (isCorrect) {
            circlClass += "border-green-500 bg-green-500 text-white";
          } else if (isSelected) {
            circlClass += "border-red-400 bg-red-400 text-white";
          } else {
            circlClass += "border-gray-200 text-gray-300";
          }

          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => onSelect(i)}
              className={btnClass}
            >
              <span className={circlClass}>{String.fromCharCode(65 + i)}</span>
              <span className="flex-1">{option}</span>
              {answered && isCorrect && <span className="ml-auto text-green-600">✓</span>}
              {answered && isSelected && !isCorrect && <span className="ml-auto text-red-500">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Feedback after answering */}
      {answered && (
        <div className={`px-4 py-2 text-xs border-t ${selected === frage.korrektIndex ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"}`}>
          {selected === frage.korrektIndex
            ? "✓ Richtig!"
            : `✗ Falsch. Richtige Antwort: ${frage.optionen![frage.korrektIndex!]}`}
        </div>
      )}
    </div>
  );
}

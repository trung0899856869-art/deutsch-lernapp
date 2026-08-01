"use client";

import { deleteGrammatik } from "@/lib/actions/grammatik";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

interface Eintrag {
  id: string;
  kategorie: string;
  titel: string;
  inhalt: string;
  beispiele?: string | null;
  notes?: string | null;
  tags?: string[] | null;
}

export function GrammatikCard({ eintrag }: { eintrag: Eintrag }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  function handleDelete() {
    if (!confirm("Löschen?")) return;
    startTransition(async () => {
      await deleteGrammatik(eintrag.id);
    });
  }

  return (
    <div className="rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
            {eintrag.kategorie}
          </span>
          <h3 className="font-semibold text-gray-900 mt-0.5">{eintrag.titel}</h3>
        </div>
        <span className="text-gray-400 ml-2">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <div className="pt-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {eintrag.inhalt}
          </div>

          {eintrag.beispiele && (
            <div className="mt-3 space-y-1">
              {eintrag.beispiele.split("\n").filter(Boolean).map((line, i) => (
                <p key={i} className="text-sm text-gray-600 border-l-2 border-blue-200 pl-3">
                  „{line}"
                </p>
              ))}
            </div>
          )}

          {eintrag.notes && (
            <p className="mt-2 text-sm text-gray-500 italic">{eintrag.notes}</p>
          )}

          {eintrag.tags && eintrag.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {eintrag.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => router.push(`/grammatik/${eintrag.id}/bearbeiten`)}
              className="text-sm text-blue-600 hover:underline"
            >
              Bearbeiten
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleDelete}
              disabled={pending}
              className="text-sm text-red-500 hover:underline disabled:opacity-50"
            >
              Löschen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

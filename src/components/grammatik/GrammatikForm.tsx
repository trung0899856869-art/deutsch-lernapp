"use client";

import { useState, useTransition } from "react";
import { createGrammatik, updateGrammatik } from "@/lib/actions/grammatik";
import { useRouter } from "next/navigation";

interface Props {
  initial?: {
    id: string;
    kategorie: string;
    titel: string;
    inhalt: string;
    beispiele?: string | null;
    notes?: string | null;
    tags?: string[] | null;
  };
}

const KATEGORIEN = [
  "Adjektivdeklination",
  "Artikel",
  "Kasus",
  "Konjugation",
  "Modalverben",
  "Nomen",
  "Perfekt",
  "Präpositionen",
  "Satzbau",
  "Trennbare Verben",
  "Sonstiges",
];

export function GrammatikForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [kategorie, setKategorie] = useState(initial?.kategorie ?? KATEGORIEN[0]);
  const [custom, setCustom] = useState(!KATEGORIEN.includes(initial?.kategorie ?? ""));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      kategorie: custom ? (fd.get("kategorieCustom") as string) : kategorie,
      titel: fd.get("titel") as string,
      inhalt: fd.get("inhalt") as string,
      beispiele: (fd.get("beispiele") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
      tags: (fd.get("tags") as string)
        ? (fd.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    };
    startTransition(async () => {
      if (initial?.id) {
        await updateGrammatik(initial.id, input);
      } else {
        await createGrammatik(input);
      }
      router.push("/grammatik");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {/* Kategorie */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
        <div className="flex gap-2">
          <select
            value={custom ? "__custom" : kategorie}
            onChange={(e) => {
              if (e.target.value === "__custom") {
                setCustom(true);
              } else {
                setCustom(false);
                setKategorie(e.target.value);
              }
            }}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {KATEGORIEN.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
            <option value="__custom">Eigene Kategorie...</option>
          </select>
        </div>
        {custom && (
          <input
            name="kategorieCustom"
            required
            defaultValue={!KATEGORIEN.includes(initial?.kategorie ?? "") ? initial?.kategorie ?? "" : ""}
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Kategorie eingeben"
          />
        )}
      </div>

      {/* Titel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
        <input
          name="titel"
          required
          defaultValue={initial?.titel ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="z.B. Schwache Adjektivdeklination"
        />
      </div>

      {/* Inhalt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Inhalt</label>
        <textarea
          name="inhalt"
          required
          defaultValue={initial?.inhalt ?? ""}
          rows={6}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          placeholder="Grammatikregel hier eingeben..."
        />
        <p className="text-xs text-gray-400 mt-1">Markdown wird unterstützt</p>
      </div>

      {/* Beispiele */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Beispielsätze (optional)
        </label>
        <textarea
          name="beispiele"
          defaultValue={initial?.beispiele ?? ""}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ein Satz pro Zeile"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notizen (Tiếng Việt, optional)
        </label>
        <textarea
          name="notes"
          defaultValue={initial?.notes ?? ""}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags (Komma-getrennt)
        </label>
        <input
          name="tags"
          defaultValue={initial?.tags?.join(", ") ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="z.B. A2, Deklination"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Speichern..." : initial?.id ? "Aktualisieren" : "Hinzufügen"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}

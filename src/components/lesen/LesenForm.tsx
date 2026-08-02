"use client";

import { useTransition, useState } from "react";
import { createLesenText, updateLesenText, createLesenFrage } from "@/lib/actions/lesen";
import { useRouter } from "next/navigation";

interface Props {
  initial?: {
    id: string;
    titel: string;
    inhalt: string;
    niveau?: string | null;
    thema?: string | null;
    notes?: string | null;
    tags?: string[] | null;
  };
}

const NIVEAUS = ["A1", "A2", "B1", "B2", "C1", "C2"];

interface LocalFrage {
  frage: string;
  antwort: string;
}

export function LesenForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [localFragen, setLocalFragen] = useState<LocalFrage[]>([]);
  const [newFrage, setNewFrage] = useState("");
  const [newAntwort, setNewAntwort] = useState("");
  const [addingFrage, setAddingFrage] = useState(false);

  function addFrage() {
    if (!newFrage.trim() || !newAntwort.trim()) return;
    setLocalFragen((prev) => [...prev, { frage: newFrage.trim(), antwort: newAntwort.trim() }]);
    setNewFrage("");
    setNewAntwort("");
    setAddingFrage(false);
  }

  function removeFrage(i: number) {
    setLocalFragen((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      titel: fd.get("titel") as string,
      inhalt: fd.get("inhalt") as string,
      niveau: (fd.get("niveau") as string) || undefined,
      thema: (fd.get("thema") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
      tags: (fd.get("tags") as string)
        ? (fd.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    };
    startTransition(async () => {
      if (initial?.id) {
        await updateLesenText(initial.id, input);
        // Save any newly added questions for edit mode
        for (let i = 0; i < localFragen.length; i++) {
          await createLesenFrage({ textId: initial.id, ...localFragen[i], sortOrder: i });
        }
        router.push(`/lesen/${initial.id}`);
      } else {
        const entry = await createLesenText(input);
        for (let i = 0; i < localFragen.length; i++) {
          await createLesenFrage({ textId: entry.id, ...localFragen[i], sortOrder: i });
        }
        router.push(`/lesen/${entry.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
        <input
          name="titel"
          required
          defaultValue={initial?.titel ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
          <select
            name="niveau"
            defaultValue={initial?.niveau ?? "A2"}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {NIVEAUS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thema</label>
          <input
            name="thema"
            defaultValue={initial?.thema ?? ""}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="z.B. Wohnen"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
        <textarea
          name="inhalt"
          required
          defaultValue={initial?.inhalt ?? ""}
          rows={10}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Füge hier den deutschen Text ein..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notizen (Tiếng Việt)
        </label>
        <textarea
          name="notes"
          defaultValue={initial?.notes ?? ""}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <input
          name="tags"
          defaultValue={initial?.tags?.join(", ") ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="z.B. A2, Wohnen"
        />
      </div>

      {/* Fragen */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Verständnisfragen <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          {!addingFrage && (
            <button
              type="button"
              onClick={() => setAddingFrage(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              + Frage hinzufügen
            </button>
          )}
        </div>

        {/* Existing local questions */}
        {localFragen.length > 0 && (
          <div className="space-y-2 mb-3">
            {localFragen.map((f, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium truncate">{f.frage}</p>
                  <p className="text-xs text-gray-500 truncate">{f.antwort}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFrage(i)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-xs shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add question inline form */}
        {addingFrage && (
          <div className="p-3 bg-blue-50 rounded-lg space-y-2 border border-blue-100">
            <input
              type="text"
              value={newFrage}
              onChange={(e) => setNewFrage(e.target.value)}
              placeholder="Frage eingeben..."
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <textarea
              value={newAntwort}
              onChange={(e) => setNewAntwort(e.target.value)}
              placeholder="Antwort eingeben..."
              rows={2}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addFrage}
                disabled={!newFrage.trim() || !newAntwort.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
              >
                Hinzufügen
              </button>
              <button
                type="button"
                onClick={() => { setAddingFrage(false); setNewFrage(""); setNewAntwort(""); }}
                className="px-3 py-1.5 text-gray-600 rounded text-sm hover:bg-gray-100"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
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

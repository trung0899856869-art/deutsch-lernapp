"use client";

import { useTransition } from "react";
import { createSchreiben, updateSchreiben } from "@/lib/actions/schreiben";
import { useRouter } from "next/navigation";

interface Props {
  initial?: {
    id: string;
    thema: string;
    inhalt: string;
    korrektur?: string | null;
    notes?: string | null;
    tags?: string[] | null;
  };
}

export function SchreibenForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      thema: fd.get("thema") as string,
      inhalt: fd.get("inhalt") as string,
      korrektur: (fd.get("korrektur") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
      tags: (fd.get("tags") as string)
        ? (fd.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    };
    startTransition(async () => {
      if (initial?.id) {
        await updateSchreiben(initial.id, input);
        router.push(`/schreiben/${initial.id}`);
      } else {
        const entry = await createSchreiben(input);
        router.push(`/schreiben/${entry.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Thema / Titel</label>
        <input
          name="thema"
          required
          defaultValue={initial?.thema ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="z.B. Meine Wohnung"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mein Text</label>
        <textarea
          name="inhalt"
          required
          defaultValue={initial?.inhalt ?? ""}
          rows={10}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Schreib hier deinen Text auf Deutsch..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Korrektur (optional)
        </label>
        <textarea
          name="korrektur"
          defaultValue={initial?.korrektur ?? ""}
          rows={6}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-green-50"
          placeholder="Korrigierte Version (vom Lehrer oder selbst korrigiert)..."
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
          placeholder="z.B. A2, Aufsatz"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Speichern..." : initial?.id ? "Aktualisieren" : "Speichern"}
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

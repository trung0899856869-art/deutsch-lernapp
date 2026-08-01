"use client";

import { useTransition } from "react";
import { createLesenText, updateLesenText } from "@/lib/actions/lesen";
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

export function LesenForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

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
        router.push(`/lesen/${initial.id}`);
      } else {
        const entry = await createLesenText(input);
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

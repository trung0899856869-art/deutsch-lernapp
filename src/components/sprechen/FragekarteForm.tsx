"use client";

import { useTransition } from "react";
import { createFragekarte, updateFragekarte } from "@/lib/actions/sprechen";
import { useRouter } from "next/navigation";

interface Props {
  initial?: {
    id: string;
    thema: string;
    vokabelHinweis?: string | null;
    musterfrage?: string | null;
    musterantwort?: string | null;
    notes?: string | null;
    tags?: string[] | null;
  };
}

export function FragekarteForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      thema: fd.get("thema") as string,
      vokabelHinweis: (fd.get("vokabelHinweis") as string) || undefined,
      musterfrage: (fd.get("musterfrage") as string) || undefined,
      musterantwort: (fd.get("musterantwort") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
      tags: (fd.get("tags") as string)
        ? (fd.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    };
    startTransition(async () => {
      if (initial?.id) {
        await updateFragekarte(initial.id, input);
      } else {
        await createFragekarte(input);
      }
      router.push("/sprechen/fragekarten");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Thema</label>
        <input
          name="thema"
          required
          defaultValue={initial?.thema ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="z.B. Wohnen"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vokabular-Hinweis (optional)
        </label>
        <input
          name="vokabelHinweis"
          defaultValue={initial?.vokabelHinweis ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="z.B. die Wand, das Zimmer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Musterfrage (optional)
        </label>
        <input
          name="musterfrage"
          defaultValue={initial?.musterfrage ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="z.B. Wie groß ist dein Zimmer?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Musterantwort (optional)
        </label>
        <textarea
          name="musterantwort"
          defaultValue={initial?.musterantwort ?? ""}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="z.B. Mein Zimmer ist ca. 15 Quadratmeter groß."
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

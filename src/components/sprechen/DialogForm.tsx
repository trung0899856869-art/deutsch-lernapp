"use client";

import { useState, useTransition } from "react";
import { createDialog, updateDialog } from "@/lib/actions/sprechen";
import { useRouter } from "next/navigation";
import type { DialogZeile } from "@/lib/actions/sprechen";

interface Props {
  initial?: {
    id: string;
    titel: string;
    zeilen: DialogZeile[];
    thema?: string | null;
    notes?: string | null;
    tags?: string[] | null;
  };
}

export function DialogForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [zeilen, setZeilen] = useState<DialogZeile[]>(
    initial?.zeilen ?? [{ sprecher: "A", text: "" }, { sprecher: "B", text: "" }]
  );

  function addZeile() {
    const lastSprecher = zeilen[zeilen.length - 1]?.sprecher ?? "A";
    const nextSprecher = lastSprecher === "A" ? "B" : "A";
    setZeilen([...zeilen, { sprecher: nextSprecher, text: "" }]);
  }

  function removeZeile(i: number) {
    setZeilen(zeilen.filter((_, idx) => idx !== i));
  }

  function updateZeile(i: number, field: keyof DialogZeile, value: string) {
    setZeilen(zeilen.map((z, idx) => idx === i ? { ...z, [field]: value } : z));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      titel: fd.get("titel") as string,
      zeilen: zeilen.filter((z) => z.text.trim()),
      thema: (fd.get("thema") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
      tags: (fd.get("tags") as string)
        ? (fd.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    };
    startTransition(async () => {
      if (initial?.id) {
        await updateDialog(initial.id, input);
        router.push(`/sprechen/dialoge/${initial.id}`);
      } else {
        const entry = await createDialog(input);
        router.push(`/sprechen/dialoge/${entry.id}`);
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
          placeholder="z.B. Im Restaurant"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thema</label>
          <input
            name="thema"
            defaultValue={initial?.thema ?? ""}
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
      </div>

      {/* Dialog Zeilen */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dialogzeilen</label>
        <div className="space-y-2">
          {zeilen.map((z, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input
                value={z.sprecher}
                onChange={(e) => updateZeile(i, "sprecher", e.target.value)}
                className="w-12 rounded border border-gray-300 px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={4}
              />
              <input
                value={z.text}
                onChange={(e) => updateZeile(i, "text", e.target.value)}
                className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Text eingeben..."
              />
              <button
                type="button"
                onClick={() => removeZeile(i)}
                className="text-gray-400 hover:text-red-500 px-1 py-1.5"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addZeile}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          + Zeile hinzufügen
        </button>
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

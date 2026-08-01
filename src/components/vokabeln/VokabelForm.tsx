"use client";

import { useState, useTransition } from "react";
import { WORTART_LIST, type Wortart } from "@/lib/constants";
import { createVokabel, updateVokabel } from "@/lib/actions/vokabeln";
import { parseNounShorthand, computePluralForm } from "@/lib/noun-parser";
import { useRouter } from "next/navigation";

interface Props {
  initial?: {
    id: string;
    wortart: string;
    grundform: string;
    bedeutung: string;
    artikel?: string | null;
    pluralSuffix?: string | null;
    pluralForm?: string | null;
    partizip2?: string | null;
    hilfsverb?: string | null;
    praesensEr?: string | null;
    praeteritum?: string | null;
    komparativ?: string | null;
    superlativ?: string | null;
    beispiel?: string | null;
    notes?: string | null;
    tags?: string[] | null;
  };
}

const ARTIKEL_OPTIONS = ["der", "die", "das"];
const PLURAL_SUFFIXES = ["-", "e", '"e', "er", '"er', "en", "n", "nen", "s"];
const HILFSVERB_OPTIONS = ["haben", "sein"];

export function VokabelForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [wortart, setWortart] = useState<Wortart>(
    (initial?.wortart as Wortart) ?? "Substantiv"
  );

  // Substantiv
  const [artikel, setArtikel] = useState(initial?.artikel ?? "der");
  const [pluralSuffix, setPluralSuffix] = useState(initial?.pluralSuffix ?? "en");

  // Shorthand input toggle
  const [shorthandMode, setShorthandMode] = useState(false);
  const [shorthandInput, setShorthandInput] = useState("");
  const [shorthandError, setShorthandError] = useState("");

  function handleShorthandParse() {
    const parsed = parseNounShorthand(shorthandInput);
    if (!parsed) {
      setShorthandError('Format: "e. Wand, \\"e"');
      return;
    }
    setShorthandError("");
    setArtikel(parsed.artikel);
    setPluralSuffix(parsed.pluralSuffix);
    setShorthandMode(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const grundform = fd.get("grundform") as string;
    const pSuffix = fd.get("pluralSuffix") as string;

    startTransition(async () => {
      const input = {
        wortart,
        grundform,
        bedeutung: fd.get("bedeutung") as string,
        artikel: wortart === "Substantiv" ? (fd.get("artikel") as string) : undefined,
        pluralSuffix: wortart === "Substantiv" ? pSuffix : undefined,
        pluralForm:
          wortart === "Substantiv" ? computePluralForm(grundform, pSuffix) : undefined,
        partizip2: wortart === "Verb" ? (fd.get("partizip2") as string) || undefined : undefined,
        hilfsverb: wortart === "Verb" ? (fd.get("hilfsverb") as string) || undefined : undefined,
        praesensEr: wortart === "Verb" ? (fd.get("praesensEr") as string) || undefined : undefined,
        praeteritum: wortart === "Verb" ? (fd.get("praeteritum") as string) || undefined : undefined,
        komparativ:
          wortart === "Adjektiv" ? (fd.get("komparativ") as string) || undefined : undefined,
        superlativ:
          wortart === "Adjektiv" ? (fd.get("superlativ") as string) || undefined : undefined,
        beispiel: (fd.get("beispiel") as string) || undefined,
        notes: (fd.get("notes") as string) || undefined,
        tags: (fd.get("tags") as string)
          ? (fd.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      if (initial?.id) {
        await updateVokabel(initial.id, input);
      } else {
        await createVokabel(input);
      }
      router.push("/vokabeln");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {/* Wortart */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Wortart</label>
        <div className="flex flex-wrap gap-2">
          {WORTART_LIST.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWortart(w)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                wortart === w
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Grundform */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {wortart === "Verb" ? "Infinitiv" : "Grundform"}
        </label>
        <input
          name="grundform"
          required
          defaultValue={initial?.grundform ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={wortart === "Substantiv" ? "z.B. Wand" : wortart === "Verb" ? "z.B. sehen" : ""}
        />
      </div>

      {/* Bedeutung (Vietnamese) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bedeutung (Tiếng Việt)
        </label>
        <input
          name="bedeutung"
          required
          defaultValue={initial?.bedeutung ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="z.B. bức tường"
        />
      </div>

      {/* Substantiv-specific fields */}
      {wortart === "Substantiv" && (
        <>
          <div className="flex gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Artikel</label>
              <select
                name="artikel"
                value={artikel}
                onChange={(e) => setArtikel(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ARTIKEL_OPTIONS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plural</label>
              <select
                name="pluralSuffix"
                value={pluralSuffix}
                onChange={(e) => setPluralSuffix(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PLURAL_SUFFIXES.map((s) => (
                  <option key={s} value={s}>+{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Shorthand mode */}
          <div>
            <button
              type="button"
              onClick={() => setShorthandMode(!shorthandMode)}
              className="text-sm text-blue-600 hover:underline"
            >
              {shorthandMode ? "Abbrechen" : "Kurzschreibweise eingeben"}
            </button>
            {shorthandMode && (
              <div className="mt-2 flex gap-2">
                <input
                  value={shorthandInput}
                  onChange={(e) => setShorthandInput(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='e. Wand, "e'
                />
                <button
                  type="button"
                  onClick={handleShorthandParse}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Übernehmen
                </button>
              </div>
            )}
            {shorthandError && (
              <p className="text-red-500 text-xs mt-1">{shorthandError}</p>
            )}
          </div>
        </>
      )}

      {/* Verb-specific fields */}
      {wortart === "Verb" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partizip II</label>
              <input
                name="partizip2"
                defaultValue={initial?.partizip2 ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. gesehen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hilfsverb</label>
              <select
                name="hilfsverb"
                defaultValue={initial?.hilfsverb ?? "haben"}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {HILFSVERB_OPTIONS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Präsens er/sie/es (unreg.)
              </label>
              <input
                name="praesensEr"
                defaultValue={initial?.praesensEr ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. sieht"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Präteritum (ich)
              </label>
              <input
                name="praeteritum"
                defaultValue={initial?.praeteritum ?? ""}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. sah"
              />
            </div>
          </div>
        </div>
      )}

      {/* Adjektiv-specific fields */}
      {wortart === "Adjektiv" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Komparativ</label>
            <input
              name="komparativ"
              defaultValue={initial?.komparativ ?? ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. schöner"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Superlativ</label>
            <input
              name="superlativ"
              defaultValue={initial?.superlativ ?? ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. am schönsten"
            />
          </div>
        </div>
      )}

      {/* Shared fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Beispielsatz (optional)
        </label>
        <input
          name="beispiel"
          defaultValue={initial?.beispiel ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="z.B. Die Wand ist weiß."
        />
      </div>

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags (Komma-getrennt)
        </label>
        <input
          name="tags"
          defaultValue={initial?.tags?.join(", ") ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="z.B. Wohnen, A2"
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

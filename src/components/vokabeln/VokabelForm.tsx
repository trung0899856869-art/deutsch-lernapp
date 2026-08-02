"use client";

import { useState, useTransition } from "react";
import { WORTART_LIST, type Wortart } from "@/lib/constants";
import { createVokabel, updateVokabel } from "@/lib/actions/vokabeln";
import { parseNounShorthand, computePluralForm } from "@/lib/noun-parser";
import { getStem } from "@/lib/word-forms/verb-forms";
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
    verbtyp?: string | null;
    praefixVerb?: string | null;
    partizip2?: string | null;
    hilfsverb?: string | null;
    praesensIch?: string | null;
    praesensDu?: string | null;
    praesensEr?: string | null;
    praesensWir?: string | null;
    praesensIhr?: string | null;
    praesensSie?: string | null;
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

function computeRegularPraesens(inf: string) {
  const s = getStem(inf);
  return {
    ich: s + "e",
    du: s + "st",
    er: s + "t",
    wir: inf,
    ihr: s + "t",
    sie: inf,
  };
}

export function VokabelForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [wortart, setWortart] = useState<Wortart>(
    (initial?.wortart as Wortart) ?? "Substantiv"
  );

  // Grundform (tracked for verb conjugation preview)
  const [grundform, setGrundform] = useState(initial?.grundform ?? "");
  // Präteritum ich-form (tracked for live preview)
  const [praeteritumIch, setPraeteritumIch] = useState(initial?.praeteritum ?? "");

  // Verbtyp
  const [verbtyp, setVerbtyp] = useState(initial?.verbtyp ?? "normal");
  const [praefixVerb, setPraefixVerb] = useState(initial?.praefixVerb ?? "");

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
        verbtyp: wortart === "Verb" ? verbtyp : undefined,
        praefixVerb: wortart === "Verb" && verbtyp !== "normal" ? praefixVerb || undefined : undefined,
        partizip2: wortart === "Verb" ? (fd.get("partizip2") as string) || undefined : undefined,
        hilfsverb: wortart === "Verb" ? (fd.get("hilfsverb") as string) || undefined : undefined,
        praesensIch: wortart === "Verb" ? (fd.get("praesensIch") as string) || undefined : undefined,
        praesensDu: wortart === "Verb" ? (fd.get("praesensDu") as string) || undefined : undefined,
        praesensEr: wortart === "Verb" ? (fd.get("praesensEr") as string) || undefined : undefined,
        praesensWir: wortart === "Verb" ? (fd.get("praesensWir") as string) || undefined : undefined,
        praesensIhr: wortart === "Verb" ? (fd.get("praesensIhr") as string) || undefined : undefined,
        praesensSie: wortart === "Verb" ? (fd.get("praesensSie") as string) || undefined : undefined,
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
          value={grundform}
          onChange={(e) => setGrundform(e.target.value)}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
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
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
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
          {/* Verbtyp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Verbtyp</label>
            <div className="flex gap-2">
              {(["normal", "trennbar", "untrennbar"] as const).map((typ) => (
                <button
                  key={typ}
                  type="button"
                  onClick={() => setVerbtyp(typ)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    verbtyp === typ
                      ? typ === "trennbar"
                        ? "bg-orange-500 text-white border-orange-500"
                        : typ === "untrennbar"
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {typ === "normal" ? "Normal" : typ === "trennbar" ? "Trennbar (T)" : "Untrennbar (U)"}
                </button>
              ))}
            </div>
            {verbtyp === "trennbar" && (
              <div className="mt-2">
                <label className="block text-xs text-gray-500 mb-1">
                  Präfix <span className="text-gray-400">(z.B. „an" → „an|rufen", trennt sich beim Konjugieren)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    value={praefixVerb}
                    onChange={(e) => setPraefixVerb(e.target.value)}
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="z.B. an"
                    className="w-24 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {praefixVerb && grundform && grundform.startsWith(praefixVerb) && (
                    <span className="text-sm text-orange-600 font-medium">
                      → {praefixVerb}|{grundform.slice(praefixVerb.length)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Partizip II: <span className="font-medium">{praefixVerb && grundform ? `${praefixVerb}ge...` : "Präfix + ge + Stamm"}</span> (z.B. angerufen)</p>
              </div>
            )}
            {verbtyp === "untrennbar" && (
              <div className="mt-2">
                <label className="block text-xs text-gray-500 mb-1">
                  Präfix <span className="text-gray-400">(z.B. „ver" → „verstehen", bleibt immer beim Verb)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    value={praefixVerb}
                    onChange={(e) => setPraefixVerb(e.target.value)}
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="z.B. ver"
                    className="w-24 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {praefixVerb && grundform && (
                    <span className="text-sm text-purple-600 font-medium">{grundform}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Partizip II: <span className="font-medium">kein „ge-"</span> (z.B. verstanden, nicht <s>geversanden</s>)</p>
              </div>
            )}
          </div>

          {/* Partizip II + Hilfsverb */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partizip II</label>
              <input
                name="partizip2"
                defaultValue={initial?.partizip2 ?? ""}
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
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

          {/* Präsens conjugation table */}
          <PraesensTable grundform={grundform} initial={initial} />

          {/* Präteritum */}
          <PraeteritumTable praeteritumIch={praeteritumIch} onIchChange={setPraeteritumIch} />
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
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. schöner"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Superlativ</label>
            <input
              name="superlativ"
              defaultValue={initial?.superlativ ?? ""}
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
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
          autoCorrect="off"
          spellCheck={false}
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

interface PraeteritumTableProps {
  praeteritumIch: string;
  onIchChange: (v: string) => void;
}

function PraeteritumTable({ praeteritumIch, onIchChange }: PraeteritumTableProps) {
  const ich = praeteritumIch;
  const preview: [string, string, string, string][] = [
    ["du", ich ? ich + "st" : "", "ihr", ich ? ich + "t" : ""],
    ["er/sie/es", ich, "sie/Sie", ich ? ich + "en" : ""],
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Präteritum{" "}
        <span className="text-xs font-normal text-gray-400">(restliche Formen auto)</span>
      </label>
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
        {/* ich input */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16 shrink-0">ich</span>
          <input
            name="praeteritum"
            value={praeteritumIch}
            onChange={(e) => onIchChange(e.target.value)}
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="z.B. sah"
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {/* computed preview (read-only) */}
        {ich && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 border-t border-gray-200">
            {preview.map(([p1, f1, p2, f2]) => (
              <div key={p1} className="contents">
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-16 shrink-0">{p1}</span>
                  <span className="text-gray-600">{f1}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-400 w-16 shrink-0">{p2}</span>
                  <span className="text-gray-600">{f2}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PraesensTableProps {
  grundform: string;
  initial?: {
    praesensIch?: string | null;
    praesensDu?: string | null;
    praesensEr?: string | null;
    praesensWir?: string | null;
    praesensIhr?: string | null;
    praesensSie?: string | null;
  } | null;
}

function PraesensTable({ grundform, initial }: PraesensTableProps) {
  const reg = computeRegularPraesens(grundform || "");
  const inputClass = "w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500";
  const cells = [
    { label: "ich", name: "praesensIch", placeholder: reg.ich, defaultValue: initial?.praesensIch ?? "" },
    { label: "wir", name: "praesensWir", placeholder: reg.wir, defaultValue: initial?.praesensWir ?? "" },
    { label: "du", name: "praesensDu", placeholder: reg.du, defaultValue: initial?.praesensDu ?? "" },
    { label: "ihr", name: "praesensIhr", placeholder: reg.ihr, defaultValue: initial?.praesensIhr ?? "" },
    { label: "er/sie/es", name: "praesensEr", placeholder: reg.er, defaultValue: initial?.praesensEr ?? "" },
    { label: "sie/Sie", name: "praesensSie", placeholder: reg.sie, defaultValue: initial?.praesensSie ?? "" },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Präsens{" "}
        <span className="text-xs font-normal text-gray-400">
          (leer lassen = regelmäßig)
        </span>
      </label>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
        {cells.map(({ label, name, placeholder, defaultValue }) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
            <input
              name={name}
              defaultValue={defaultValue}
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder={placeholder}
              className={inputClass}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

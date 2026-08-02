"use client";

import { WORTART_COLORS, type Wortart } from "@/lib/constants";
import { WortartBadge } from "./WortartBadge";
import { formatNounDisplay, getAdjektivDeklinationsTables, type AdjCell } from "@/lib/noun-parser";
import { deleteVokabel } from "@/lib/actions/vokabeln";
import { speakGerman } from "@/lib/tts";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

interface Vokabel {
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
  synonyme?: string[] | null;
  antonyme?: string[] | null;
}

export function VokabelCard({ vokabel }: { vokabel: Vokabel }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showDekl, setShowDekl] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const wortart = vokabel.wortart as Wortart;
  const colors = WORTART_COLORS[wortart];

  function handleDelete() {
    startTransition(async () => {
      await deleteVokabel(vokabel.id);
    });
  }

  return (
    <div className={`rounded-lg border-l-4 bg-white shadow-sm p-4 ${colors.underline} border-l`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-semibold text-gray-900">
              {wortart === "Substantiv" && vokabel.artikel
                ? `${vokabel.artikel} ${vokabel.grundform}`
                : wortart === "Verb" && vokabel.verbtyp === "trennbar" && vokabel.praefixVerb
                ? `${vokabel.praefixVerb}|${vokabel.grundform.slice(vokabel.praefixVerb.length)}`
                : vokabel.grundform}
            </span>
            <WortartBadge wortart={wortart} />
            {wortart === "Verb" && vokabel.verbtyp === "trennbar" && (
              <span className="text-xs font-bold bg-orange-100 text-orange-700 rounded px-1.5 py-0.5">T</span>
            )}
            {wortart === "Verb" && vokabel.verbtyp === "untrennbar" && (
              <span className="text-xs font-bold bg-purple-100 text-purple-700 rounded px-1.5 py-0.5">U</span>
            )}
            <button
              onClick={() => speakGerman(
                wortart === "Substantiv" && vokabel.artikel
                  ? `${vokabel.artikel} ${vokabel.grundform}`
                  : vokabel.grundform
              )}
              className="text-gray-300 hover:text-blue-500 transition-colors text-sm"
              title="Aussprache"
            >
              🔊
            </button>
          </div>

          {/* Substantiv: plural */}
          {wortart === "Substantiv" && vokabel.pluralForm && (
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-sm text-gray-500">Plural: die {vokabel.pluralForm}</p>
              <button
                onClick={() => speakGerman(`die ${vokabel.pluralForm}`)}
                className="text-gray-300 hover:text-blue-500 transition-colors text-xs"
                title="Aussprache Plural"
              >🔊</button>
            </div>
          )}

          {/* Verb: principal parts summary */}
          {wortart === "Verb" && (
            <div className="mt-0.5 space-y-0.5">
              {(vokabel.partizip2 || vokabel.praeteritum) && (
                <p className="text-sm text-gray-500">
                  {[
                    vokabel.partizip2 && `${vokabel.partizip2} (${vokabel.hilfsverb ?? "haben"})`,
                    vokabel.praeteritum && `ich ${vokabel.praeteritum}`,
                  ].filter(Boolean).join(" · ")}
                </p>
              )}
              {(vokabel.praesensIch || vokabel.praesensDu || vokabel.praesensEr) && (
                <p className="text-xs text-gray-400">
                  Präs:{" "}
                  {[
                    vokabel.praesensIch && `ich ${vokabel.praesensIch}`,
                    vokabel.praesensDu && `du ${vokabel.praesensDu}`,
                    vokabel.praesensEr && `er ${vokabel.praesensEr}`,
                  ].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          )}

          {/* Adjektiv: komparativ/superlativ */}
          {wortart === "Adjektiv" && (vokabel.komparativ || vokabel.superlativ) && (
            <p className="text-sm text-gray-500 mt-0.5">
              {[vokabel.komparativ, vokabel.superlativ].filter(Boolean).join(" · ")}
            </p>
          )}

          {/* Bedeutung */}
          <p className="mt-1 text-gray-700">{vokabel.bedeutung}</p>

          {/* Notes */}
          {vokabel.notes && (
            <p className="mt-1 text-sm text-gray-500 italic">{vokabel.notes}</p>
          )}

          {/* Beispiel */}
          {vokabel.beispiel && (
            <div className="mt-1 flex items-start gap-1.5 border-l-2 border-gray-200 pl-2">
              <p className="text-sm text-gray-600 flex-1">„{vokabel.beispiel}"</p>
              <button
                onClick={() => speakGerman(vokabel.beispiel!)}
                className="text-gray-300 hover:text-blue-500 transition-colors text-xs shrink-0 mt-0.5"
                title="Aussprache Beispiel"
              >🔊</button>
            </div>
          )}

          {/* Tags */}
          {vokabel.tags && vokabel.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {vokabel.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Adjektiv Deklination table toggle */}
          {wortart === "Adjektiv" && (
            <button
              onClick={() => setShowDekl(!showDekl)}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              {showDekl ? "Tabelle ausblenden" : "Deklination anzeigen"}
            </button>
          )}

          {showDekl && wortart === "Adjektiv" && (
            <AdjDeklTable grundform={vokabel.grundform} />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 shrink-0 items-start">
          {confirmDelete ? (
            <div className="flex gap-1 items-center">
              <button
                onClick={handleDelete}
                disabled={pending}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Löschen
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                Nein
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => router.push(`/vokabeln/${vokabel.id}/bearbeiten`)}
                className="p-2.5 text-gray-400 hover:text-blue-600 rounded"
                title="Bearbeiten"
              >
                ✏️
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2.5 text-gray-400 hover:text-red-500 rounded"
                title="Löschen"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AdjCellDisplay({ cell }: { cell: AdjCell }) {
  return (
    <span>
      {cell.article && <span className="text-gray-400 mr-0.5">{cell.article}</span>}
      <span>{cell.stem}</span>
      <span className="font-bold text-yellow-700">{cell.ending}</span>
    </span>
  );
}

function AdjDeklTable({ grundform }: { grundform: string }) {
  const sections = getAdjektivDeklinationsTables(grundform);
  return (
    <div className="mt-2 space-y-4">
      {sections.map((sec) => (
        <div key={sec.title}>
          <p className="text-xs font-semibold text-gray-700 mb-0.5">{sec.title}</p>
          <p className="text-xs text-gray-400 mb-1">{sec.subtitle}</p>
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["", "Mask.", "Fem.", "Neut.", "Plural"].map((h) => (
                    <th key={h} className="border border-gray-200 px-2 py-1 text-left font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sec.rows.map((row) => (
                  <tr key={row.kasus} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-2 py-1 text-gray-400 font-medium w-10">{row.kasus}</td>
                    <td className="border border-gray-200 px-2 py-1"><AdjCellDisplay cell={row.mask} /></td>
                    <td className="border border-gray-200 px-2 py-1"><AdjCellDisplay cell={row.fem} /></td>
                    <td className="border border-gray-200 px-2 py-1"><AdjCellDisplay cell={row.neut} /></td>
                    <td className="border border-gray-200 px-2 py-1"><AdjCellDisplay cell={row.plural} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { WORTART_COLORS, type Wortart } from "@/lib/constants";
import { WortartBadge } from "./WortartBadge";
import { speakGerman } from "@/lib/tts";
import { deleteVokabel } from "@/lib/actions/vokabeln";
import { getAdjektivDeklinationsTable } from "@/lib/noun-parser";

interface Vokabel {
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
}

export function VokabelDetailPanel({ vokabel }: { vokabel: Vokabel }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDekl, setShowDekl] = useState(false);
  const wortart = vokabel.wortart as Wortart;
  const colors = WORTART_COLORS[wortart];

  const displayWord =
    wortart === "Substantiv" && vokabel.artikel
      ? `${vokabel.artikel} ${vokabel.grundform}`
      : vokabel.grundform;

  function handleDelete() {
    startTransition(async () => {
      await deleteVokabel(vokabel.id);
    });
  }

  return (
    <div className={`rounded-xl border-l-4 bg-white shadow-sm overflow-hidden ${colors.underline}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-2xl font-bold text-gray-900">{displayWord}</h2>
              <button
                onClick={() => speakGerman(displayWord)}
                className="text-gray-300 hover:text-blue-500 transition-colors text-lg"
                title="Aussprache"
              >🔊</button>
            </div>
            <WortartBadge wortart={wortart} />
          </div>

          {/* Actions */}
          <div className="flex gap-1 shrink-0">
            {confirmDelete ? (
              <>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                >Löschen</button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >Nein</button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push(`/vokabeln/${vokabel.id}/bearbeiten`)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Bearbeiten"
                >✏️</button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  title="Löschen"
                >🗑️</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Grammatical forms */}
        {wortart === "Substantiv" && vokabel.pluralForm && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Plural</p>
            <div className="flex items-center gap-2">
              <p className="text-gray-700">die {vokabel.pluralForm}</p>
              <button
                onClick={() => speakGerman(`die ${vokabel.pluralForm}`)}
                className="text-gray-300 hover:text-blue-500 text-sm"
              >🔊</button>
            </div>
          </div>
        )}

        {wortart === "Verb" && (vokabel.partizip2 || vokabel.praesensEr || vokabel.praeteritum) && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Verbformen</p>
            <div className="flex flex-wrap gap-3">
              {vokabel.partizip2 && (
                <span className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded">
                  {vokabel.partizip2} {vokabel.hilfsverb && `(${vokabel.hilfsverb})`}
                </span>
              )}
              {vokabel.praesensEr && (
                <span className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded">
                  er {vokabel.praesensEr}
                </span>
              )}
              {vokabel.praeteritum && (
                <span className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded">
                  Prät. {vokabel.praeteritum}
                </span>
              )}
            </div>
          </div>
        )}

        {wortart === "Adjektiv" && (vokabel.komparativ || vokabel.superlativ) && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Steigerung</p>
            <div className="flex gap-3">
              {vokabel.komparativ && (
                <span className="text-sm bg-yellow-50 text-yellow-700 px-2 py-1 rounded">{vokabel.komparativ}</span>
              )}
              {vokabel.superlativ && (
                <span className="text-sm bg-yellow-50 text-yellow-700 px-2 py-1 rounded">{vokabel.superlativ}</span>
              )}
            </div>
          </div>
        )}

        {/* Bedeutung */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bedeutung</p>
          <p className="text-gray-800 text-lg">{vokabel.bedeutung}</p>
        </div>

        {/* Notes */}
        {vokabel.notes && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notizen</p>
            <p className="text-gray-600 italic text-sm">{vokabel.notes}</p>
          </div>
        )}

        {/* Beispiel */}
        {vokabel.beispiel && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Beispiel</p>
            <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3 border-l-2 border-gray-300">
              <p className="text-sm text-gray-700 flex-1 italic">„{vokabel.beispiel}"</p>
              <button
                onClick={() => speakGerman(vokabel.beispiel!)}
                className="text-gray-300 hover:text-blue-500 text-sm shrink-0"
              >🔊</button>
            </div>
          </div>
        )}

        {/* Tags */}
        {vokabel.tags && vokabel.tags.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {vokabel.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Adjektiv declension toggle */}
        {wortart === "Adjektiv" && (
          <div>
            <button
              onClick={() => setShowDekl(!showDekl)}
              className="text-xs text-blue-600 hover:underline"
            >
              {showDekl ? "Tabelle ausblenden" : "Deklination anzeigen"}
            </button>
            {showDekl && <AdjDeklTable grundform={vokabel.grundform} />}
          </div>
        )}
      </div>
    </div>
  );
}

function AdjDeklTable({ grundform }: { grundform: string }) {
  const table = getAdjektivDeklinationsTable(grundform);
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="text-xs border-collapse w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-2 py-1 text-left font-medium">Kasus</th>
            <th className="border border-gray-200 px-2 py-1 text-left font-medium">Mask.</th>
            <th className="border border-gray-200 px-2 py-1 text-left font-medium">Fem.</th>
            <th className="border border-gray-200 px-2 py-1 text-left font-medium">Neut.</th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.kasus}>
              <td className="border border-gray-200 px-2 py-1 text-gray-500">{row.kasus}</td>
              {row.values.map((v, i) => (
                <td key={i} className="border border-gray-200 px-2 py-1">{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-gray-400 text-xs mt-1">schwach / gemischt / stark</p>
    </div>
  );
}

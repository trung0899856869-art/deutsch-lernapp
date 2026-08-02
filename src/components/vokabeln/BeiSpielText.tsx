"use client";

import { useEffect, useState } from "react";
import { getWordFormIndexExcluding } from "@/lib/actions/vokabeln";
import { buildFormIndex, highlightText } from "@/lib/text-highlighter";
import { WORTART_COLORS, type Wortart } from "@/lib/constants";

type FormRow = {
  form: string;
  wortart: string;
  vokabelId: string;
  grundform: string;
  bedeutung: string;
  artikel: string | null;
};

interface ActiveTooltip {
  x: number;
  y: number;
  vokabelId: string;
  grundform: string;
  wortart: Wortart;
  bedeutung: string;
  artikel: string | null;
}

const DASHED_BORDER: Record<Wortart, string> = {
  Substantiv: "border-blue-400",
  Verb: "border-red-400",
  Adjektiv: "border-yellow-500",
  Adverb: "border-purple-400",
  Präposition: "border-orange-400",
  Phrase: "border-green-400",
};

export function BeiSpielText({ text, excludeWortart }: { text: string; excludeWortart: string }) {
  const [formRows, setFormRows] = useState<FormRow[]>([]);
  const [tooltip, setTooltip] = useState<ActiveTooltip | null>(null);

  useEffect(() => {
    getWordFormIndexExcluding(excludeWortart).then((rows) =>
      setFormRows(rows as FormRow[])
    );
  }, [excludeWortart]);

  useEffect(() => {
    if (!tooltip) return;
    const close = () => setTooltip(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [tooltip]);

  // Build index using only the fields text-highlighter needs
  const formIndex = buildFormIndex(
    formRows.map((r) => ({
      form: r.form,
      wortart: r.wortart as Wortart,
      vokabelId: r.vokabelId,
      grundform: r.grundform,
    }))
  );
  // Keep a lookup by vokabelId for the extra fields
  const extraById = new Map(formRows.map((r) => [r.vokabelId, r]));

  const words = highlightText(text, formIndex);

  function handleClick(e: React.MouseEvent, vokabelId: string, wortart: string) {
    e.stopPropagation();
    const extra = extraById.get(vokabelId);
    if (!extra) return;

    if (tooltip?.vokabelId === vokabelId) {
      setTooltip(null);
      return;
    }
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = Math.max(100, Math.min(rect.left + rect.width / 2, window.innerWidth - 100));
    setTooltip({
      x,
      y: rect.top,
      vokabelId,
      grundform: extra.grundform,
      wortart: wortart as Wortart,
      bedeutung: extra.bedeutung,
      artikel: extra.artikel,
    });
  }

  return (
    <span>
      {words.map((word, i) => {
        const w = word.wortart as Wortart | null;
        if (!w || !(w in WORTART_COLORS)) {
          return <span key={i}>{word.text}</span>;
        }
        return (
          <span
            key={i}
            className={`cursor-pointer border-b border-dashed ${DASHED_BORDER[w]} hover:opacity-60 transition-opacity`}
            onClick={(e) => handleClick(e, word.vokabelId!, word.wortart!)}
          >
            {word.text}
          </span>
        );
      })}

      {tooltip && (
        <span
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 6,
            transform: "translate(-50%, -100%)",
          }}
        >
          <span className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl flex flex-col gap-1 min-w-[120px] max-w-[220px]">
            {/* Row 1: dot + display word + wortart badge */}
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${WORTART_COLORS[tooltip.wortart].dot}`} />
              <span className="font-semibold truncate">
                {tooltip.wortart === "Substantiv" && tooltip.artikel
                  ? `${tooltip.artikel} ${tooltip.grundform}`
                  : tooltip.grundform}
              </span>
              <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${WORTART_COLORS[tooltip.wortart].badge}`}>
                {tooltip.wortart}
              </span>
            </span>
            {/* Row 2: bedeutung */}
            <span className="text-gray-300 text-[11px] leading-snug line-clamp-2 pl-3.5">
              {tooltip.bedeutung}
            </span>
          </span>
        </span>
      )}
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getWordFormIndexExcluding } from "@/lib/actions/vokabeln";
import { buildFormIndex, highlightText, type WordFormMatch } from "@/lib/text-highlighter";
import { WORTART_COLORS, type Wortart } from "@/lib/constants";

const DASHED_BORDER: Record<Wortart, string> = {
  Substantiv: "border-blue-400",
  Verb: "border-red-400",
  Adjektiv: "border-yellow-500",
  Adverb: "border-purple-400",
  Präposition: "border-orange-400",
  Phrase: "border-green-400",
};

interface ActiveTooltip {
  x: number;
  y: number;
  grundform: string;
  wortart: Wortart;
}

export function BeiSpielText({ text, excludeWortart }: { text: string; excludeWortart: string }) {
  const [formRows, setFormRows] = useState<WordFormMatch[]>([]);
  const [tooltip, setTooltip] = useState<ActiveTooltip | null>(null);

  useEffect(() => {
    getWordFormIndexExcluding(excludeWortart).then((rows) =>
      setFormRows(rows as WordFormMatch[])
    );
  }, [excludeWortart]);

  useEffect(() => {
    if (!tooltip) return;
    const close = () => setTooltip(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [tooltip]);

  const formIndex = buildFormIndex(formRows);
  const words = highlightText(text, formIndex);

  function handleClick(e: React.MouseEvent, grundform: string, wortart: string) {
    e.stopPropagation();
    if (tooltip?.grundform === grundform) {
      setTooltip(null);
      return;
    }
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = Math.max(80, Math.min(rect.left + rect.width / 2, window.innerWidth - 80));
    setTooltip({ x, y: rect.top, grundform, wortart: wortart as Wortart });
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
            onClick={(e) => handleClick(e, word.grundform!, word.wortart!)}
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
            top: tooltip.y - 4,
            transform: "translate(-50%, -100%)",
          }}
        >
          <span className="bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-2 whitespace-nowrap">
            <span className={`w-2 h-2 rounded-full shrink-0 ${WORTART_COLORS[tooltip.wortart].dot}`} />
            <span className="font-semibold">{tooltip.grundform}</span>
            <span className="text-gray-400 text-[10px]">{tooltip.wortart}</span>
          </span>
        </span>
      )}
    </span>
  );
}

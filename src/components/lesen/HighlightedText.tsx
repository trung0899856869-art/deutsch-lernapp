"use client";

import { useState, useMemo } from "react";
import { buildFormIndex, highlightText } from "@/lib/text-highlighter";
import { WORTART_COLORS, type Wortart } from "@/lib/constants";
import type { WordFormMatch } from "@/lib/text-highlighter";

interface Props {
  text: string;
  formRows: WordFormMatch[];
}

interface TooltipInfo {
  grundform: string;
  wortart: Wortart;
  x: number;
  y: number;
}

export function HighlightedText({ text, formRows }: Props) {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  const index = useMemo(() => buildFormIndex(formRows), [formRows]);
  const tokens = useMemo(() => highlightText(text, index), [text, index]);

  function handleClick(e: React.MouseEvent, match: WordFormMatch) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      grundform: match.grundform,
      wortart: match.wortart,
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 4,
    });
  }

  return (
    <div
      className="relative leading-8 text-gray-900"
      onClick={(e) => {
        if ((e.target as HTMLElement).tagName !== "SPAN") setTooltip(null);
      }}
    >
      {tokens.map((token, i) => {
        if (!token.wortart || !token.vokabelId) {
          return <span key={i}>{token.text}</span>;
        }

        const wortart = token.wortart as Wortart;
        const colors = WORTART_COLORS[wortart];
        const match: WordFormMatch = {
          form: token.text.toLowerCase(),
          wortart,
          vokabelId: token.vokabelId,
          grundform: token.grundform!,
        };

        return (
          <span
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              handleClick(e, match);
            }}
            className={`border-b-2 cursor-pointer hover:opacity-80 ${colors.underline}`}
          >
            {token.text}
          </span>
        );
      })}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${WORTART_COLORS[tooltip.wortart].dot}`}
            />
            <span className="font-medium">{tooltip.grundform}</span>
            <span className="text-gray-300">{tooltip.wortart}</span>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { buildFormIndex, highlightText } from "@/lib/text-highlighter";
import { WORTART_COLORS, type Wortart } from "@/lib/constants";
import type { WordFormMatch } from "@/lib/text-highlighter";

interface Props {
  text: string;
  formRows: WordFormMatch[];
  onWordClick?: (vokabelId: string) => void;
}

export function HighlightedText({ text, formRows, onWordClick }: Props) {
  const index = useMemo(() => buildFormIndex(formRows), [formRows]);
  const tokens = useMemo(() => highlightText(text, index), [text, index]);

  return (
    <div className="leading-8 text-gray-900">
      {tokens.map((token, i) => {
        if (!token.wortart || !token.vokabelId) {
          return <span key={i}>{token.text}</span>;
        }

        const wortart = token.wortart as Wortart;
        const colors = WORTART_COLORS[wortart];

        return (
          <span
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onWordClick?.(token.vokabelId!);
            }}
            className={`border-b-2 cursor-pointer hover:opacity-70 transition-opacity ${colors.underline}`}
          >
            {token.text}
          </span>
        );
      })}
    </div>
  );
}

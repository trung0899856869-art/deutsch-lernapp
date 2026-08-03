"use client";

import { useState } from "react";
import { HighlightedText } from "./HighlightedText";
import { VokabelQuickModal } from "./VokabelQuickModal";
import type { WordFormMatch } from "@/lib/text-highlighter";

export function LesenInteractiveArea({
  text,
  formRows,
}: {
  text: string;
  formRows: WordFormMatch[];
}) {
  const [selectedVokabelId, setSelectedVokabelId] = useState<string | null>(null);

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
        <HighlightedText
          text={text}
          formRows={formRows}
          onWordClick={setSelectedVokabelId}
        />
      </div>

      {selectedVokabelId && (
        <VokabelQuickModal
          vokabelId={selectedVokabelId}
          onClose={() => setSelectedVokabelId(null)}
        />
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getVokabelById } from "@/lib/actions/vokabeln";
import { VokabelDetailPanel } from "@/components/vokabeln/VokabelDetailPanel";

type Vokabel = NonNullable<Awaited<ReturnType<typeof getVokabelById>>>;

export function VokabelQuickModal({
  vokabelId,
  onClose,
}: {
  vokabelId: string;
  onClose: () => void;
}) {
  const [vokabel, setVokabel] = useState<Vokabel | null>(null);

  useEffect(() => {
    setVokabel(null);
    getVokabelById(vokabelId).then((v) => { if (v) setVokabel(v); });
  }, [vokabelId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg overflow-y-auto max-h-[90vh] sm:max-h-[85vh] sm:rounded-2xl rounded-t-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end bg-white rounded-t-2xl sm:rounded-t-2xl px-4 pt-3 pb-0">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-sm"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        {vokabel ? (
          <div className="px-4 pb-6 bg-white">
            <VokabelDetailPanel vokabel={vokabel} />
          </div>
        ) : (
          <div className="p-10 text-center bg-white">
            <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-2" />
            <p className="text-sm text-gray-400">Lädt...</p>
          </div>
        )}
      </div>
    </div>
  );
}

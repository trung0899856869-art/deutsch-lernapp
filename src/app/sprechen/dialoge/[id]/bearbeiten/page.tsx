export const dynamic = "force-dynamic";
import { getDialogById } from "@/lib/actions/sprechen";
import { notFound } from "next/navigation";
import { DialogForm } from "@/components/sprechen/DialogForm";
import Link from "next/link";
import type { DialogZeile } from "@/lib/actions/sprechen";

export default async function DialogBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dialog = await getDialogById(id);
  if (!dialog) notFound();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/sprechen/dialoge/${id}`} className="text-gray-400 hover:text-gray-600">
          ← Zurück
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Dialog bearbeiten</h1>
      </div>
      <DialogForm
        initial={{
          id: dialog.id,
          titel: dialog.titel,
          zeilen: (dialog.zeilen as DialogZeile[]) ?? [],
          thema: dialog.thema,
          notes: dialog.notes,
          tags: dialog.tags,
        }}
      />
    </div>
  );
}

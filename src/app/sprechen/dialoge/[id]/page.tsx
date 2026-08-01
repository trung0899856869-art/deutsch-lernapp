export const dynamic = "force-dynamic";
import { getDialogById } from "@/lib/actions/sprechen";
import { notFound } from "next/navigation";
import { DialogPlayer } from "@/components/sprechen/DialogPlayer";
import Link from "next/link";
import type { DialogZeile } from "@/lib/actions/sprechen";

export default async function DialogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dialog = await getDialogById(id);
  if (!dialog) notFound();

  const zeilen = (dialog.zeilen as DialogZeile[]) ?? [];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/sprechen" className="text-gray-400 hover:text-gray-600">← Zurück</Link>
        <div className="flex-1" />
        <Link
          href={`/sprechen/dialoge/${id}/bearbeiten`}
          className="text-sm text-blue-600 hover:underline"
        >
          Bearbeiten
        </Link>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-1">{dialog.titel}</h1>
      {dialog.thema && <p className="text-sm text-gray-500 mb-4">{dialog.thema}</p>}

      <DialogPlayer titel={dialog.titel} zeilen={zeilen} notes={dialog.notes} />
    </div>
  );
}

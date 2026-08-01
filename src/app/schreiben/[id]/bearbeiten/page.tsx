export const dynamic = "force-dynamic";
import { getSchreibenById } from "@/lib/actions/schreiben";
import { notFound } from "next/navigation";
import { SchreibenForm } from "@/components/schreiben/SchreibenForm";
import Link from "next/link";

export default async function SchreibenBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await getSchreibenById(id);
  if (!entry) notFound();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/schreiben/${id}`} className="text-gray-400 hover:text-gray-600">← Zurück</Link>
        <h1 className="text-xl font-bold text-gray-900">Text bearbeiten</h1>
      </div>
      <SchreibenForm initial={entry} />
    </div>
  );
}

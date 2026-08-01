export const dynamic = "force-dynamic";
import { getLesenTextById } from "@/lib/actions/lesen";
import { notFound } from "next/navigation";
import { LesenForm } from "@/components/lesen/LesenForm";
import Link from "next/link";

export default async function LesenBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const text = await getLesenTextById(id);
  if (!text) notFound();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/lesen/${id}`} className="text-gray-400 hover:text-gray-600">← Zurück</Link>
        <h1 className="text-xl font-bold text-gray-900">Text bearbeiten</h1>
      </div>
      <LesenForm initial={text} />
    </div>
  );
}

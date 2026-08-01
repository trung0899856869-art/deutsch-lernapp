export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { grammatik } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { GrammatikForm } from "@/components/grammatik/GrammatikForm";
import Link from "next/link";

export default async function GrammatikBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [entry] = await db.select().from(grammatik).where(eq(grammatik.id, id));
  if (!entry) notFound();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/grammatik" className="text-gray-400 hover:text-gray-600">← Zurück</Link>
        <h1 className="text-xl font-bold text-gray-900">Grammatik bearbeiten</h1>
      </div>
      <GrammatikForm initial={entry} />
    </div>
  );
}

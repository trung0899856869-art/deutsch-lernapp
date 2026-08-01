import { FragekarteForm } from "@/components/sprechen/FragekarteForm";
import Link from "next/link";

export default function FragekarteNeuPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sprechen/fragekarten" className="text-gray-400 hover:text-gray-600">
          ← Zurück
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Neue Fragekarte</h1>
      </div>
      <FragekarteForm />
    </div>
  );
}

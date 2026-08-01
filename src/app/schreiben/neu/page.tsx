import { SchreibenForm } from "@/components/schreiben/SchreibenForm";
import Link from "next/link";

export default function SchreibenNeuPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/schreiben" className="text-gray-400 hover:text-gray-600">← Zurück</Link>
        <h1 className="text-xl font-bold text-gray-900">Neuer Text</h1>
      </div>
      <SchreibenForm />
    </div>
  );
}

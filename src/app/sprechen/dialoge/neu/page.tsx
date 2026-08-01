import { DialogForm } from "@/components/sprechen/DialogForm";
import Link from "next/link";

export default function DialogNeuPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sprechen" className="text-gray-400 hover:text-gray-600">← Zurück</Link>
        <h1 className="text-xl font-bold text-gray-900">Neuer Dialog</h1>
      </div>
      <DialogForm />
    </div>
  );
}

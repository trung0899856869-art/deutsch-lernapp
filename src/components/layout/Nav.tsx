"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/vokabeln", label: "Vokabeln", icon: "📖" },
  { href: "/grammatik", label: "Grammatik", icon: "📝" },
  { href: "/lesen", label: "Lesen", icon: "📄" },
  { href: "/schreiben", label: "Schreiben", icon: "✍️" },
  { href: "/sprechen", label: "Sprechen", icon: "💬" },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col w-56 shrink-0 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-blue-700">Deutsch</h1>
        <p className="text-xs text-gray-400">Lernapp</p>
      </div>
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <ul className="flex">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-xs transition-colors",
                  active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

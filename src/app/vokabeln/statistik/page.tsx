export const dynamic = "force-dynamic";
import { getVokabelnStats } from "@/lib/actions/vokabeln";
import Link from "next/link";

export default async function VokabelnStatistikPage() {
  const stats = await getVokabelnStats();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/vokabeln" className="text-gray-400 hover:text-gray-600">
            ← Zurück
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Statistik</h1>
        </div>
        <a
          href="/api/export/vokabeln"
          download
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          ⬇ CSV
        </a>
      </div>

      {/* Retention Rate */}
      {stats.retentionRate !== null && (
        <>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Behaltensrate
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
            <div className="flex items-end gap-3">
              <span className={`text-4xl font-bold ${stats.retentionRate >= 80 ? "text-green-600" : stats.retentionRate >= 60 ? "text-orange-500" : "text-red-500"}`}>
                {stats.retentionRate}%
              </span>
              <span className="text-sm text-gray-400 pb-1">der Wiederholungen korrekt (Qualität ≥ 3)</span>
            </div>
            <div className="mt-3 bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${stats.retentionRate >= 80 ? "bg-green-500" : stats.retentionRate >= 60 ? "bg-orange-400" : "bg-red-400"}`}
                style={{ width: `${stats.retentionRate}%` }}
              />
            </div>
          </div>
        </>
      )}

      {/* SRS Status */}
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Lernfortschritt
      </h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Neu" value={stats.newCards} color="blue" desc="Noch nie geübt" />
        <StatCard label="Lernen" value={stats.learning} color="orange" desc="Interval &lt; 21 Tage" />
        <StatCard label="Reif" value={stats.mature} color="green" desc="Interval ≥ 21 Tage" />
      </div>

      {/* Due */}
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Fällig
      </h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Heute" value={stats.dueToday} color="red" />
        <StatCard label="Diese Woche" value={stats.dueThisWeek} color="purple" />
      </div>

      {/* Wortart breakdown */}
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Gesamt: {stats.total} Wörter
      </h2>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {Object.entries(stats.byWortart)
          .sort(([, a], [, b]) => b - a)
          .map(([wortart, count]) => (
            <div key={wortart} className="flex items-center gap-3 px-4 py-3">
              <span className="text-sm text-gray-600 w-24 shrink-0">{wortart}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.round((count / stats.total) * 100)}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-800 w-8 text-right">{count}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  desc,
}: {
  label: string;
  value: number;
  color: string;
  desc?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <div className={`rounded-xl p-4 text-center ${colorMap[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5">{label}</p>
      {desc && <p className="text-xs opacity-60 mt-0.5">{desc}</p>}
    </div>
  );
}

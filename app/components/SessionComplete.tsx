interface Stats {
  easy: number;
  medium: number;
  hard: number;
}

interface Props {
  stats: Stats;
  onRestart: () => void;
}

export default function SessionComplete({ stats, onRestart }: Props) {
  const total = stats.easy + stats.medium + stats.hard;
  const easyPct = total > 0 ? Math.round((stats.easy / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-4">
          <span className="material-icons-round text-6xl text-emerald-400 select-none">
            task_alt
          </span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-100">Session Complete!</h1>
        <p className="text-zinc-500 mt-2">
          You reviewed{" "}
          <span className="font-semibold text-zinc-300">{total}</span> card
          {total !== 1 ? "s" : ""} — great work.
        </p>
      </div>

      {/* Stats card */}
      <div className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 p-8 w-full max-w-sm mb-8">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-5">
          Session Results
        </h2>
        <div className="space-y-3">
          <StatRow
            label="Easy"
            value={stats.easy}
            bg="bg-emerald-950/40"
            text="text-emerald-400"
          />
          <StatRow
            label="Medium"
            value={stats.medium}
            bg="bg-amber-950/40"
            text="text-amber-400"
          />
          <StatRow
            label="Hard"
            value={stats.hard}
            bg="bg-red-950/40"
            text="text-red-400"
          />
        </div>

        {total > 0 && (
          <div className="mt-5 pt-4 border-t border-zinc-800">
            <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
              <span>Confidence</span>
              <span>{easyPct}% easy</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${(stats.easy / total) * 100}%` }}
              />
              <div
                className="bg-amber-400 h-full transition-all"
                style={{ width: `${(stats.medium / total) * 100}%` }}
              />
              <div
                className="bg-red-500 h-full transition-all"
                style={{ width: `${(stats.hard / total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Back button */}
      <button
        onClick={onRestart}
        className="w-full max-w-sm px-8 py-4 bg-indigo-500 text-white text-base font-semibold rounded-xl hover:bg-indigo-400 active:scale-[0.98] transition-all"
      >
        Back to Home
      </button>
    </div>
  );
}

function StatRow({
  label,
  value,
  bg,
  text,
}: {
  label: string;
  value: number;
  bg: string;
  text: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-400">{label}</span>
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${bg} ${text}`}
      >
        {value}
      </span>
    </div>
  );
}

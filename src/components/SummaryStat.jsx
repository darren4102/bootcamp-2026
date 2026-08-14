export default function SummaryStat({ label, value, accent = "ink" }) {
  const accentClasses = {
    amber: "text-signal-amber-dark",
    green: "text-rail-green-dark",
    ink: "text-ink-900",
    slate: "text-slate-blue",
  };
  return (
    <div className="rounded-xl border border-paper-300 bg-paper-50 px-5 py-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">{label}</p>
      <p className={`mt-1.5 font-display text-3xl font-semibold tabular-nums ${accentClasses[accent]}`}>
        {value}
      </p>
    </div>
  );
}

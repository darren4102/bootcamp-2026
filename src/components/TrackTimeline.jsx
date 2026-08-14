import { useNavigate } from "react-router-dom";
import { isActive } from "../utils/storage";

// A literal rail-line visualization: obstructions are plotted as blocks along
// a track spanning from 2 days ago to 7 days from now, with sleepers marking
// the passage of time and a "NOW" signal post at the current moment.
export default function TrackTimeline({ requests }) {
  const navigate = useNavigate();
  const windowStart = Date.now() - 2 * 24 * 3600 * 1000;
  const windowEnd = Date.now() + 7 * 24 * 3600 * 1000;
  const span = windowEnd - windowStart;
  const now = Date.now();

  const pct = (t) => Math.min(100, Math.max(0, ((new Date(t).getTime() - windowStart) / span) * 100));

  const visible = requests.filter(
    (r) =>
      r.status === "Approved" &&
      new Date(r.endDateTime).getTime() >= windowStart &&
      new Date(r.startDateTime).getTime() <= windowEnd
  );

  const sleeperCount = 28;

  return (
    <div className="rounded-xl border border-paper-300 bg-paper-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold text-ink-900">Track timeline</h3>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">
            2 days ago → 7 days ahead
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wide text-ink-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rail-green pulse-dot" /> Active</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-blue" /> Upcoming</span>
        </div>
      </div>

      <div className="relative h-24 select-none">
        {/* sleepers */}
        <div className="absolute inset-x-0 top-11 flex justify-between">
          {Array.from({ length: sleeperCount }).map((_, i) => (
            <div key={i} className="h-3 w-1 rounded-sm bg-paper-300" />
          ))}
        </div>
        {/* rails */}
        <div className="absolute inset-x-0 top-9 h-0.5 bg-ink-500/40" />
        <div className="absolute inset-x-0 top-[3.4rem] h-0.5 bg-ink-500/40" />

        {/* now marker */}
        <div className="absolute top-0 bottom-0" style={{ left: `${pct(now)}%` }}>
          <div className="h-full w-px bg-alert-rust" />
          <div className="absolute -top-0.5 -translate-x-1/2 whitespace-nowrap rounded-sm bg-alert-rust px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-paper-50">
            Now
          </div>
        </div>

        {/* obstruction blocks */}
        {visible.map((r, idx) => {
          const left = pct(r.startDateTime);
          const right = pct(r.endDateTime);
          const width = Math.max(right - left, 1.2);
          const active = isActive(r);
          const row = idx % 2;
          return (
            <button
              key={r.id}
              onClick={() => navigate(`/requests/${r.id}`)}
              title={`${r.id} — ${r.location}`}
              className={`absolute h-3 rounded-sm ring-2 ring-paper-50 transition-transform hover:scale-y-125 ${
                active ? "bg-rail-green" : "bg-slate-blue"
              }`}
              style={{
                left: `${left}%`,
                width: `${width}%`,
                top: row === 0 ? "0.15rem" : "4.6rem",
              }}
            />
          );
        })}
      </div>

      {visible.length === 0 && (
        <p className="mt-2 text-center text-xs text-ink-500">No approved obstructions in this window.</p>
      )}
    </div>
  );
}

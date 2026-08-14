import { useNavigate } from "react-router-dom";
import { isActive, isCompleted } from "../utils/storage";

// Greedy interval-graph-coloring lane assignment: obstructions whose time
// ranges overlap are pushed into separate lanes so their bars never overlap
// on screen, however many of them share a date. Non-overlapping obstructions
// reuse the same lane once the earlier one has ended.
function assignLanes(items) {
  const sorted = [...items].sort(
    (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
  );
  const laneEndTimes = [];
  const laneById = new Map();
  sorted.forEach((r) => {
    const start = new Date(r.startDateTime).getTime();
    const end = new Date(r.endDateTime).getTime();
    let lane = laneEndTimes.findIndex((endTime) => endTime <= start);
    if (lane === -1) {
      lane = laneEndTimes.length;
      laneEndTimes.push(end);
    } else {
      laneEndTimes[lane] = end;
    }
    laneById.set(r.id, lane);
  });
  return laneById;
}

// Lane 0 sits just above the rails, lane 1 just below (matching the original
// two-row layout); any further lanes stack downward so 3+ overlapping
// obstructions each still get their own row.
const LANE_ROW_STEP_REM = 1.35;
const BASE_HEIGHT_REM = 6; // matches the original h-24 container
function laneTopRem(lane) {
  return lane === 0 ? 0.15 : 4.6 + (lane - 1) * LANE_ROW_STEP_REM;
}

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

  const laneById = assignLanes(visible);
  const maxLane = visible.reduce((m, r) => Math.max(m, laneById.get(r.id) ?? 0), 0);
  const containerHeightRem =
    maxLane <= 1 ? BASE_HEIGHT_REM : BASE_HEIGHT_REM + (maxLane - 1) * LANE_ROW_STEP_REM;

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
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ink-500" /> Past</span>
        </div>
      </div>

      <div className="relative select-none" style={{ height: `${containerHeightRem}rem` }}>
        {/* sleepers */}
        <div className="absolute inset-x-0 top-11 flex justify-between">
          {Array.from({ length: sleeperCount }).map((_, i) => (
            <div key={i} className="h-3 w-1 rounded-sm bg-paper-300" />
          ))}
        </div>
        {/* rails */}
        <div className="absolute inset-x-0 top-9 h-0.5 bg-ink-500/40" />
        <div className="absolute inset-x-0 top-[3.4rem] h-0.5 bg-ink-500/40" />

        {/* obstruction blocks */}
        {visible.map((r) => {
          const left = pct(r.startDateTime);
          const right = pct(r.endDateTime);
          const width = Math.max(right - left, 1.2);
          const active = isActive(r);
          const past = !active && isCompleted(r);
          const colorClass = active ? "bg-rail-green" : past ? "bg-ink-500" : "bg-slate-blue";
          const lane = laneById.get(r.id) ?? 0;
          return (
            <button
              key={r.id}
              onClick={() => navigate(`/requests/${r.id}`)}
              title={`${r.id} — ${r.location}`}
              className={`absolute z-10 h-3 rounded-sm ring-2 ring-paper-50 transition-transform hover:scale-y-125 ${colorClass}`}
              style={{
                left: `${left}%`,
                width: `${width}%`,
                top: `${laneTopRem(lane)}rem`,
              }}
            />
          );
        })}

        {/* now marker — rendered after (and above, via z-index) the obstruction blocks */}
        <div className="absolute top-0 bottom-0 z-20" style={{ left: `${pct(now)}%` }}>
          <div className="h-full w-px bg-alert-rust" />
          <div className="absolute -top-0.5 -translate-x-1/2 whitespace-nowrap rounded-sm bg-alert-rust px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-paper-50">
            Now
          </div>
        </div>
      </div>

      {visible.length === 0 && (
        <p className="mt-2 text-center text-xs text-ink-500">No approved obstructions in this window.</p>
      )}
    </div>
  );
}

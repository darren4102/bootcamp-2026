import { useMemo } from "react";
import RequesterDashboard from "./RequesterDashboard";
import RequestCard from "./RequestCard";
import SummaryStat from "./SummaryStat";
import TrackTimeline from "./TrackTimeline";
import { STATUS, isActive, isUpcoming, isCompleted } from "../utils/storage";

export default function ApproverDashboard({ requests, username }) {
  const pending = useMemo(
    () =>
      requests
        .filter((r) => r.status === STATUS.PENDING)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [requests]
  );

  const active = useMemo(() => requests.filter(isActive), [requests]);
  const upcoming = useMemo(
    () => requests.filter(isUpcoming).sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)),
    [requests]
  );
  const completed = useMemo(() => requests.filter(isCompleted), [requests]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Approver overview</h1>
        <p className="mt-1 text-sm text-ink-500">Network-wide obstruction status at a glance.</p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryStat label="Pending approval" value={pending.length} accent="amber" />
          <SummaryStat label="Active now" value={active.length} accent="green" />
          <SummaryStat label="Completed" value={completed.length} accent="ink" />
        </div>
      </section>

      <section>
        <TrackTimeline requests={requests} />
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Pending your approval</h2>
          <span className="font-mono text-xs text-ink-500">{pending.length} awaiting review</span>
        </div>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-paper-300 bg-paper-50 px-6 py-8 text-center">
            <p className="text-sm font-medium text-ink-700">Queue is clear.</p>
            <p className="mt-1 text-sm text-ink-500">No requests are currently awaiting approval.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pending.map((r) => (
              <RequestCard key={r.id} request={r} showRequester />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Upcoming obstructions</h2>
          <span className="font-mono text-xs text-ink-500">{upcoming.length} approved &amp; scheduled</span>
        </div>
        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-paper-300 bg-paper-50 px-6 py-8 text-center">
            <p className="text-sm text-ink-500">Nothing approved and scheduled ahead yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcoming.slice(0, 6).map((r) => (
              <RequestCard key={r.id} request={r} showRequester />
            ))}
          </div>
        )}
      </section>

      <div className="border-t border-paper-300 pt-8">
        <RequesterDashboard requests={requests} username={username} embedded />
      </div>
    </div>
  );
}

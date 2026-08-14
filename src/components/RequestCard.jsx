import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const PRIORITY_STYLES = {
  Critical: "text-alert-rust-dark",
  High: "text-signal-amber-dark",
  Medium: "text-slate-blue",
  Low: "text-ink-500",
};

function formatRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const opts = { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
  return `${s.toLocaleString(undefined, opts)} → ${e.toLocaleString(undefined, opts)}`;
}

export default function RequestCard({ request, showRequester = false }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/requests/${request.id}`)}
      className="group flex w-full items-center gap-4 rounded-lg border border-paper-300 bg-paper-50 px-4 py-3.5 text-left transition-all hover:border-ink-900/25 hover:shadow-sm"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-medium text-ink-500">{request.id}</span>
          <StatusBadge status={request.status} />
        </div>
        <p className="mt-1.5 truncate font-display text-[15px] font-medium text-ink-900">
          {request.location}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-500">
          <span>{request.obstructionType}</span>
          <span className="text-paper-300">•</span>
          <span>{formatRange(request.startDateTime, request.endDateTime)}</span>
          {showRequester && (
            <>
              <span className="text-paper-300">•</span>
              <span>by {request.requesterUsername}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-4">
        <span className={`font-mono text-[11px] font-semibold uppercase tracking-wide ${PRIORITY_STYLES[request.priority] || "text-ink-500"}`}>
          {request.priority}
        </span>
        <svg
          className="h-4 w-4 text-ink-500 transition-transform group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

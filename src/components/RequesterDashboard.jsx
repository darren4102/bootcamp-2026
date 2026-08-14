import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RequestCard from "./RequestCard";
import { STATUS_ORDER } from "../utils/storage";

export default function RequesterDashboard({ requests, username, embedded = false }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const own = useMemo(
    () => requests.filter((r) => r.requesterUsername === username).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [requests, username]
  );

  const counts = useMemo(() => {
    const c = { All: own.length };
    STATUS_ORDER.forEach((s) => (c[s] = own.filter((r) => r.status === s).length));
    return c;
  }, [own]);

  const filtered = filter === "All" ? own : own.filter((r) => r.status === filter);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink-900">
          {embedded ? "My requests" : "My obstruction requests"}
        </h2>
        <button
          onClick={() => navigate("/requests/new")}
          className="rounded-md bg-ink-900 px-3.5 py-2 text-sm font-medium text-paper-50 transition-colors hover:bg-ink-800"
        >
          + New request
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {["All", ...STATUS_ORDER].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === s
                ? "bg-ink-900 text-paper-50"
                : "border border-paper-300 bg-paper-50 text-ink-700 hover:bg-paper-200"
            }`}
          >
            {s}
            <span className={`ml-1.5 font-mono ${filter === s ? "text-paper-300" : "text-ink-500"}`}>
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-paper-300 bg-paper-50 px-6 py-10 text-center">
          <p className="text-sm font-medium text-ink-700">No requests here yet.</p>
          <p className="mt-1 text-sm text-ink-500">
            {filter === "All"
              ? "Create your first obstruction request to get started."
              : `You don't have any requests with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </div>
      )}
    </section>
  );
}

import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRequests } from "../hooks/useRequests";
import RequestCard from "./RequestCard";
import { STATUS, STATUS_ORDER, OBSTRUCTION_TYPES, PRIORITIES } from "../utils/storage";

const HISTORY_STATUSES = STATUS_ORDER.filter((s) => s !== STATUS.DRAFT);

const EMPTY_FILTERS = {
  status: "All",
  obstructionType: "All",
  priority: "All",
  dateFrom: "",
  dateTo: "",
};

function matchesDateRange(request, dateFrom, dateTo) {
  const start = new Date(request.startDateTime);
  if (dateFrom && start < new Date(`${dateFrom}T00:00`)) return false;
  if (dateTo && start > new Date(`${dateTo}T23:59:59`)) return false;
  return true;
}

// History for approvers/managers: every non-draft request, unscoped by role
// or approval stage, with local filters — unlike the dashboard's "pending
// your approval" queue, everyone sees the same full list here.
export default function RequestHistory() {
  const { user } = useAuth();
  const { requests } = useRequests();
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  if (user.role !== "Approver" && user.role !== "Manager") {
    return <Navigate to="/dashboard" replace />;
  }

  function setFilter(field, value) {
    setFilters((f) => ({ ...f, [field]: value }));
  }

  const submitted = useMemo(
    () =>
      requests
        .filter((r) => r.status !== STATUS.DRAFT)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [requests]
  );

  const filtered = useMemo(
    () =>
      submitted.filter((r) => {
        if (filters.status !== "All" && r.status !== filters.status) return false;
        if (filters.obstructionType !== "All" && r.obstructionType !== filters.obstructionType) return false;
        if (filters.priority !== "All" && r.priority !== filters.priority) return false;
        if (!matchesDateRange(r, filters.dateFrom, filters.dateTo)) return false;
        return true;
      }),
    [submitted, filters]
  );

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => value !== EMPTY_FILTERS[key]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Request history</h1>
      <p className="mt-1 mb-6 text-sm text-ink-500">
        All submitted obstruction requests — pending, approved, changes required, and rejected. Drafts aren't shown.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {["All", ...HISTORY_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter("status", s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filters.status === s
                ? "bg-ink-900 text-paper-50"
                : "border border-paper-300 bg-paper-50 text-ink-700 hover:bg-paper-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-paper-300 bg-paper-50 p-4 sm:grid-cols-4">
        <FilterField label="Obstruction type">
          <select
            value={filters.obstructionType}
            onChange={(e) => setFilter("obstructionType", e.target.value)}
            className={selectClass}
          >
            <option value="All">All types</option>
            {OBSTRUCTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Priority">
          <select
            value={filters.priority}
            onChange={(e) => setFilter("priority", e.target.value)}
            className={selectClass}
          >
            <option value="All">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Start date from">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilter("dateFrom", e.target.value)}
            className={selectClass}
          />
        </FilterField>

        <FilterField label="Start date to">
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilter("dateTo", e.target.value)}
            className={selectClass}
          />
        </FilterField>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs text-ink-500">
          {filtered.length} of {submitted.length} request{submitted.length === 1 ? "" : "s"}
        </span>
        {hasActiveFilters && (
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="text-xs font-medium text-slate-blue hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-paper-300 bg-paper-50 px-6 py-10 text-center">
          <p className="text-sm font-medium text-ink-700">No requests match these filters.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((r) => (
            <RequestCard key={r.id} request={r} showRequester />
          ))}
        </div>
      )}
    </div>
  );
}

const selectClass =
  "w-full rounded-md border border-paper-300 bg-white px-2.5 py-1.5 text-sm text-ink-900 outline-none focus:border-slate-blue";

function FilterField({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{label}</label>
      {children}
    </div>
  );
}

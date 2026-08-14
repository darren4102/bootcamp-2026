import { STATUS } from "../utils/storage";

const STYLES = {
  [STATUS.DRAFT]: {
    dot: "bg-ink-500",
    text: "text-ink-600",
    bg: "bg-ink-500/10",
    ring: "ring-ink-500/20",
  },
  [STATUS.PENDING]: {
    dot: "bg-signal-amber",
    text: "text-signal-amber-dark",
    bg: "bg-signal-amber/15",
    ring: "ring-signal-amber/30",
  },
  [STATUS.APPROVED]: {
    dot: "bg-rail-green",
    text: "text-rail-green-dark",
    bg: "bg-rail-green/10",
    ring: "ring-rail-green/25",
  },
  [STATUS.CHANGES_REQUIRED]: {
    dot: "bg-slate-blue",
    text: "text-slate-blue",
    bg: "bg-slate-blue/10",
    ring: "ring-slate-blue/25",
  },
  [STATUS.REJECTED]: {
    dot: "bg-alert-rust",
    text: "text-alert-rust-dark",
    bg: "bg-alert-rust/10",
    ring: "ring-alert-rust/25",
  },
};

export default function StatusBadge({ status, className = "" }) {
  const s = STYLES[status] || STYLES[STATUS.DRAFT];
  const pulsing = status === STATUS.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono font-medium uppercase tracking-wide ring-1 ${s.bg} ${s.text} ${s.ring} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${pulsing ? "pulse-dot" : ""}`} />
      {status}
    </span>
  );
}

import { useEffect, useRef, useState } from "react";

const TIME_SLOTS = Array.from({ length: 24 * 2 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = (i % 2) * 30;
  const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const period = hours < 12 ? "AM" : "PM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return { value, label: `${displayHours}:${String(minutes).padStart(2, "0")} ${period}` };
});

function formatLabel(value) {
  return TIME_SLOTS.find((slot) => slot.value === value)?.label || "Select time";
}

// A styled dropdown/scroll time-of-day selector, meant to sit next to a
// native date input so time is chosen the same deliberate way the date is,
// instead of being typed. Value/onChange use 24-hour "HH:mm" so it composes
// directly with a "YYYY-MM-DD" date string into one local datetime value.
export default function TimePicker({ value, onChange, error, id }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "center" });
    }
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:border-slate-blue ${
          error ? "border-alert-rust/60 bg-alert-rust/5" : "border-paper-300 bg-white"
        }`}
      >
        <span className={value ? "text-ink-900" : "text-ink-500"}>{formatLabel(value)}</span>
        <svg className="h-4 w-4 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-paper-300 bg-white py-1 shadow-lg"
        >
          {TIME_SLOTS.map((slot) => (
            <button
              type="button"
              key={slot.value}
              role="option"
              aria-selected={slot.value === value}
              data-active={slot.value === value}
              onClick={() => {
                onChange(slot.value);
                setOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-paper-200 ${
                slot.value === value ? "bg-slate-blue/10 font-medium text-slate-blue" : "text-ink-800"
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

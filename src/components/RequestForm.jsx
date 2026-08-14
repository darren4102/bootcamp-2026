import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TimePicker from "./TimePicker";
import {
  STATUS,
  STAGE,
  PRIORITIES,
  OBSTRUCTION_TYPES,
  createRequest,
  updateRequestFields,
  getRequestById,
} from "../utils/storage";

const EMPTY_FORM = {
  location: "",
  obstructionType: OBSTRUCTION_TYPES[0],
  startDateTime: "",
  endDateTime: "",
  reason: "",
  description: "",
  priority: "Medium",
  attachmentName: "",
};

const REQUIRED_FIELDS = ["location", "obstructionType", "startDateTime", "endDateTime", "reason", "priority"];

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Splits the combined "YYYY-MM-DDTHH:mm" local value used by the form into
// the parts the date input and TimePicker each edit independently.
function splitLocalValue(value) {
  const [date = "", time = ""] = (value || "").split("T");
  return { date, time };
}

export default function RequestForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [notFound, setNotFound] = useState(false);
  const [existingStatus, setExistingStatus] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    const existing = getRequestById(id);
    if (!existing) {
      setNotFound(true);
      return;
    }
    setExistingStatus(existing.status);
    setForm({
      location: existing.location,
      obstructionType: existing.obstructionType,
      startDateTime: toLocalInputValue(existing.startDateTime),
      endDateTime: toLocalInputValue(existing.endDateTime),
      reason: existing.reason,
      description: existing.description || "",
      priority: existing.priority,
      attachmentName: existing.attachmentName || "",
    });
  }, [id, isEdit]);

  const heading = isEdit ? "Edit obstruction request" : "New obstruction request";

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  // Date and time are edited by separate controls but stored as the same
  // combined local "YYYY-MM-DDTHH:mm" string setField/toLocalInputValue
  // already use, so validation/payload building need no changes. Time
  // defaults to 00:00 the first time a date is picked before any time is.
  function setDateTimePart(field, part, value) {
    setForm((f) => {
      const { date, time } = splitLocalValue(f[field]);
      const nextDate = part === "date" ? value : date;
      const nextTime = part === "time" ? value : time || "00:00";
      return { ...f, [field]: nextDate ? `${nextDate}T${nextTime}` : "" };
    });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const newErrors = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (!String(form[field] || "").trim()) {
        newErrors[field] = "This field is required.";
      }
    });
    if (form.startDateTime && form.endDateTime) {
      const start = new Date(form.startDateTime);
      const end = new Date(form.endDateTime);
      if (end <= start) {
        newErrors.endDateTime = "End date/time must be after the start date/time.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function buildPayload(status) {
    const base = {
      location: form.location.trim(),
      obstructionType: form.obstructionType,
      startDateTime: new Date(form.startDateTime).toISOString(),
      endDateTime: new Date(form.endDateTime).toISOString(),
      reason: form.reason.trim(),
      description: form.description.trim(),
      priority: form.priority,
      attachmentName: form.attachmentName || null,
      status,
    };
    if (status === STATUS.PENDING) {
      // (Re)submitting always re-enters the approval chain at the start —
      // the approver reviews first even if a manager acted on the prior cycle.
      return {
        ...base,
        stage: STAGE.APPROVER,
        approverComment: null,
        approverUsername: null,
        approverActedByRole: null,
        managerComment: null,
        managerUsername: null,
      };
    }
    return base;
  }

  function handleSave(targetStatus) {
    // Drafts are allowed to be incomplete-ish, but we still enforce the
    // basics so a "draft" isn't totally empty. Submission requires full validity either way.
    const valid = validate();
    if (!valid) return;

    if (isEdit) {
      updateRequestFields(id, buildPayload(targetStatus));
    } else {
      createRequest(buildPayload(targetStatus), user.username);
    }
    navigate("/dashboard");
  }

  function handleFileClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) setField("attachmentName", file.name);
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-paper-300 bg-paper-50 px-6 py-10 text-center">
        <p className="font-medium text-ink-800">Request not found.</p>
        <button onClick={() => navigate("/dashboard")} className="mt-3 text-sm font-medium text-slate-blue hover:underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  const lockedNotice =
    isEdit && existingStatus && ![STATUS.DRAFT, STATUS.REVISE].includes(existingStatus);

  const { date: startDate, time: startTime } = splitLocalValue(form.startDateTime);
  const { date: endDate, time: endTime } = splitLocalValue(form.endDateTime);

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="font-display text-2xl font-semibold text-ink-900">{heading}</h1>
      <p className="mt-1 text-sm text-ink-500">
        Fields marked with <span className="text-alert-rust">*</span> are required.
      </p>

      {lockedNotice && (
        <div className="mt-4 rounded-md border border-signal-amber/30 bg-signal-amber/10 px-4 py-2.5 text-sm text-signal-amber-dark">
          This request has status "{existingStatus}". Edits will remain associated with the original submission.
        </div>
      )}

      <form
        onSubmit={(e) => e.preventDefault()}
        className="mt-6 space-y-5 rounded-xl border border-paper-300 bg-paper-50 p-6"
      >
        <Field label="Location" required error={errors.location}>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setField("location", e.target.value)}
            placeholder="e.g. Down Main Line — KM 42.3 to 44.1"
            className={inputClass(errors.location)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Obstruction type" required error={errors.obstructionType}>
            <select
              value={form.obstructionType}
              onChange={(e) => setField("obstructionType", e.target.value)}
              className={inputClass(errors.obstructionType)}
            >
              {OBSTRUCTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Priority" required error={errors.priority}>
            <select
              value={form.priority}
              onChange={(e) => setField("priority", e.target.value)}
              className={inputClass(errors.priority)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Start date &amp; time" required error={errors.startDateTime}>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setDateTimePart("startDateTime", "date", e.target.value)}
                className={`${inputClass(errors.startDateTime)} flex-1`}
              />
              <div className="w-32">
                <TimePicker
                  value={startTime}
                  onChange={(t) => setDateTimePart("startDateTime", "time", t)}
                  error={errors.startDateTime}
                />
              </div>
            </div>
          </Field>
          <Field label="End date &amp; time" required error={errors.endDateTime}>
            <div className="flex gap-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setDateTimePart("endDateTime", "date", e.target.value)}
                className={`${inputClass(errors.endDateTime)} flex-1`}
              />
              <div className="w-32">
                <TimePicker
                  value={endTime}
                  onChange={(t) => setDateTimePart("endDateTime", "time", t)}
                  error={errors.endDateTime}
                />
              </div>
            </div>
          </Field>
        </div>

        <Field label="Reason" required error={errors.reason}>
          <input
            type="text"
            value={form.reason}
            onChange={(e) => setField("reason", e.target.value)}
            placeholder="Short summary, e.g. Rail joint replacement"
            className={inputClass(errors.reason)}
          />
        </Field>

        <Field label="Description" error={errors.description}>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={4}
            placeholder="Additional detail for the approver: scope of works, crew, safety considerations..."
            className={inputClass(errors.description)}
          />
        </Field>

        <Field label="Attachment">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleFileClick}
              className="rounded-md border border-paper-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:bg-paper-200"
            >
              Choose file
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            <span className="truncate text-sm text-ink-500">
              {form.attachmentName || "No file selected"}
            </span>
          </div>
        </Field>

        <div className="flex flex-col-reverse gap-3 border-t border-paper-300 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => handleSave(STATUS.DRAFT)}
            className="rounded-md border border-paper-300 bg-white px-4 py-2.5 text-sm font-medium text-ink-800 hover:bg-paper-200"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(STATUS.PENDING)}
            className="rounded-md bg-ink-900 px-4 py-2.5 text-sm font-semibold text-paper-50 hover:bg-ink-800"
          >
            Submit for approval
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
        {required && <span className="ml-0.5 text-alert-rust">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-alert-rust">{error}</p>}
    </div>
  );
}

function inputClass(hasError) {
  return `w-full rounded-md border px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-slate-blue ${
    hasError ? "border-alert-rust/60 bg-alert-rust/5" : "border-paper-300 bg-white"
  }`;
}

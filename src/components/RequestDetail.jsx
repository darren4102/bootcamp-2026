import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "./StatusBadge";
import { STATUS, getRequestById, updateRequestFields } from "../utils/storage";

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(() => getRequestById(id));
  const [comment, setComment] = useState("");
  const [actionError, setActionError] = useState("");
  const [confirming, setConfirming] = useState(null); // 'Reject' | 'Changes Required' | null

  const isOwner = request?.requesterUsername === user.username;
  const isApprover = user.role === "Approver";
  const canReview = isApprover && request?.status === STATUS.PENDING;
  const canEdit = isOwner && [STATUS.DRAFT, STATUS.CHANGES_REQUIRED].includes(request?.status);

  const durationHrs = useMemo(() => {
    if (!request) return 0;
    return Math.round((new Date(request.endDateTime) - new Date(request.startDateTime)) / 36e5);
  }, [request]);

  if (!request) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-paper-300 bg-paper-50 px-6 py-10 text-center">
        <p className="font-medium text-ink-800">Request not found.</p>
        <button onClick={() => navigate("/dashboard")} className="mt-3 text-sm font-medium text-slate-blue hover:underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  function refresh() {
    setRequest(getRequestById(id));
  }

  function handleApprove() {
    updateRequestFields(id, {
      status: STATUS.APPROVED,
      approverComment: comment.trim() || null,
      approverUsername: user.username,
    });
    refresh();
    setComment("");
    setConfirming(null);
  }

  function handleReject() {
    if (!comment.trim()) {
      setActionError("Please add a comment explaining the rejection.");
      return;
    }
    updateRequestFields(id, {
      status: STATUS.REJECTED,
      approverComment: comment.trim(),
      approverUsername: user.username,
    });
    refresh();
    setComment("");
    setConfirming(null);
    setActionError("");
  }

  function handleRequestChanges() {
    if (!comment.trim()) {
      setActionError("Please add a comment describing the changes needed.");
      return;
    }
    updateRequestFields(id, {
      status: STATUS.CHANGES_REQUIRED,
      approverComment: comment.trim(),
      approverUsername: user.username,
    });
    refresh();
    setComment("");
    setConfirming(null);
    setActionError("");
  }

  function handleSubmitDraft() {
    updateRequestFields(id, { status: STATUS.PENDING });
    refresh();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="rounded-xl border border-paper-300 bg-paper-50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="font-mono text-xs font-medium text-ink-500">{request.id}</span>
            <h1 className="mt-1 font-display text-xl font-semibold text-ink-900">{request.location}</h1>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <DetailItem label="Obstruction type" value={request.obstructionType} />
          <DetailItem label="Priority" value={request.priority} />
          <DetailItem label="Start" value={formatDateTime(request.startDateTime)} />
          <DetailItem label="End" value={formatDateTime(request.endDateTime)} />
          <DetailItem label="Duration" value={`${durationHrs} hour${durationHrs === 1 ? "" : "s"}`} />
          <DetailItem label="Requested by" value={request.requesterUsername} />
          <DetailItem label="Reason" value={request.reason} />
          <DetailItem
            label="Attachment"
            value={request.attachmentName || "None"}
          />
        </dl>

        {request.description && (
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Description</p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink-800">{request.description}</p>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-paper-300 pt-4 text-xs text-ink-500">
          <span>Created {formatDateTime(request.createdAt)}</span>
          <span className="text-right">Updated {formatDateTime(request.updatedAt)}</span>
        </div>

        {request.approverComment && (
          <div
            className={`mt-5 rounded-md border px-4 py-3 text-sm ${
              request.status === STATUS.REJECTED
                ? "border-alert-rust/25 bg-alert-rust/5 text-alert-rust-dark"
                : "border-slate-blue/25 bg-slate-blue/5 text-slate-blue"
            }`}
          >
            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest opacity-70">
              {request.status === STATUS.REJECTED ? "Rejection reason" : "Approver note"} — {request.approverUsername}
            </p>
            <p className="leading-relaxed">{request.approverComment}</p>
          </div>
        )}
      </div>

      {/* Requester actions */}
      {canEdit && (
        <div className="mt-5 flex flex-wrap gap-3 rounded-xl border border-paper-300 bg-paper-50 p-5">
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm font-medium text-ink-800">
              {request.status === STATUS.DRAFT ? "This request is still a draft." : "Changes were requested."}
            </p>
            <p className="mt-0.5 text-sm text-ink-500">
              {request.status === STATUS.DRAFT
                ? "Edit it any time, or submit it now for approval."
                : "Update the request based on the approver's note above, then resubmit."}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/requests/${id}/edit`)}
              className="rounded-md border border-paper-300 bg-white px-4 py-2 text-sm font-medium text-ink-800 hover:bg-paper-200"
            >
              Edit request
            </button>
            {request.status === STATUS.DRAFT && (
              <button
                onClick={handleSubmitDraft}
                className="rounded-md bg-ink-900 px-4 py-2 text-sm font-semibold text-paper-50 hover:bg-ink-800"
              >
                Submit for approval
              </button>
            )}
          </div>
        </div>
      )}

      {/* Approver actions */}
      {canReview && (
        <div className="mt-5 rounded-xl border border-paper-300 bg-paper-50 p-5">
          <h2 className="font-display text-sm font-semibold text-ink-900">Review this request</h2>
          <label className="mt-3 block text-sm font-medium text-ink-800">
            Comment <span className="font-normal text-ink-500">(required for rejection or requested changes)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (actionError) setActionError("");
            }}
            rows={3}
            placeholder="Add context for the requester..."
            className="mt-1.5 w-full rounded-md border border-paper-300 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-slate-blue"
          />
          {actionError && <p className="mt-1.5 text-xs font-medium text-alert-rust">{actionError}</p>}

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={() => (confirming === "Reject" ? handleReject() : (setConfirming("Reject"), setActionError("")))}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                confirming === "Reject"
                  ? "border-alert-rust bg-alert-rust text-paper-50"
                  : "border-alert-rust/30 text-alert-rust-dark hover:bg-alert-rust/5"
              }`}
            >
              {confirming === "Reject" ? "Confirm reject" : "Reject"}
            </button>
            <button
              onClick={() =>
                confirming === "Changes Required" ? handleRequestChanges() : (setConfirming("Changes Required"), setActionError(""))
              }
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                confirming === "Changes Required"
                  ? "border-slate-blue bg-slate-blue text-paper-50"
                  : "border-slate-blue/30 text-slate-blue hover:bg-slate-blue/5"
              }`}
            >
              {confirming === "Changes Required" ? "Confirm request changes" : "Request changes"}
            </button>
            <button
              onClick={handleApprove}
              className="rounded-md bg-rail-green px-4 py-2 text-sm font-semibold text-paper-50 hover:bg-rail-green-dark"
            >
              Approve
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-1 text-sm text-ink-900">{value}</dd>
    </div>
  );
}

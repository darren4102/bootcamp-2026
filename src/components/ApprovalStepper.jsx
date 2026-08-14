import { STATUS, STAGE } from "../utils/storage";

// Visual state per step, independent of which of the three steps it's applied to.
const STEP_STYLES = {
  complete: {
    circle: "border-rail-green bg-rail-green text-paper-50",
    label: "text-rail-green-dark",
    line: "bg-rail-green",
  },
  current: {
    circle: "border-signal-amber bg-signal-amber/15 text-signal-amber-dark",
    label: "text-signal-amber-dark",
    line: "bg-paper-300",
  },
  rejected: {
    circle: "border-alert-rust bg-alert-rust text-paper-50",
    label: "text-alert-rust-dark",
    line: "bg-alert-rust",
  },
  changes: {
    circle: "border-slate-blue bg-slate-blue text-paper-50",
    label: "text-slate-blue",
    line: "bg-slate-blue",
  },
  upcoming: {
    circle: "border-paper-300 bg-paper-50 text-ink-500",
    label: "text-ink-500",
    line: "bg-paper-300",
  },
};

// Derive the visual state of each of the three chain steps purely from the
// request's status/stage — no extra fields needed beyond what storage.js tracks.
function computeSteps(request) {
  const { status, stage, approverActedByRole, managerUsername } = request;

  const requesterState = status === STATUS.DRAFT ? "current" : "complete";
  let approverState = "upcoming";
  let managerState = "upcoming";

  if (status === STATUS.PENDING && stage === STAGE.APPROVER) {
    approverState = "current";
  } else if (status === STATUS.PENDING && stage === STAGE.MANAGER) {
    approverState = "complete";
    managerState = "current";
  } else if (status === STATUS.APPROVED) {
    approverState = "complete";
    managerState = "complete";
  } else if (status === STATUS.REJECTED || status === STATUS.REVISE) {
    const outcome = status === STATUS.REJECTED ? "rejected" : "changes";
    if (managerUsername) {
      // decision happened at the manager stage, so approver stage already passed
      approverState = "complete";
      managerState = outcome;
    } else {
      approverState = outcome;
    }
  }

  const approverOnBehalf =
    approverActedByRole === "Manager" && !["upcoming", "current"].includes(approverState);

  return [
    { key: "requester", label: "Requester", state: requesterState },
    { key: "approver", label: "Approver", state: approverState, onBehalf: approverOnBehalf },
    { key: "manager", label: "Manager", state: managerState },
  ];
}

function StepIcon({ state }) {
  if (state === "complete") {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (state === "rejected") {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    );
  }
  if (state === "changes") {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M5 9a7 7 0 0112.5-3.5M19 15a7 7 0 01-12.5 3.5" />
      </svg>
    );
  }
  if (state === "current") {
    return <span className="h-2 w-2 rounded-full bg-signal-amber pulse-dot" />;
  }
  return null;
}

export default function ApprovalStepper({ request }) {
  const steps = computeSteps(request);

  return (
    <div className="mt-6 rounded-lg border border-paper-300 bg-paper-100/60 px-5 py-5">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-ink-500">Approval chain</p>
      <div className="flex items-start">
        {steps.map((step, idx) => {
          const styles = STEP_STYLES[step.state];
          return (
            <div key={step.key} className={`flex items-center ${idx < steps.length - 1 ? "flex-1" : ""}`}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${styles.circle}`}
                >
                  <StepIcon state={step.state} />
                </div>
                <span className={`mt-2 font-mono text-[11px] font-medium uppercase tracking-wide ${styles.label}`}>
                  {step.label}
                </span>
                {step.onBehalf && (
                  <span className="mt-0.5 max-w-[7rem] text-center text-[10px] leading-tight text-ink-600">
                    on behalf of approver
                  </span>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div className={`mx-2 mt-4 h-0.5 flex-1 rounded-full transition-colors ${styles.line}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

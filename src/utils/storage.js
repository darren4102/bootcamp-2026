// All obstruction-request data lives in localStorage under this key.
// This is a POC: no backend, no real persistence guarantees beyond the browser.

const REQUESTS_KEY = "obstructionRequests";
const SESSION_KEY = "xyzCorpSession";

export const STATUS = {
  DRAFT: "Draft",
  PENDING: "Pending Approval",
  APPROVED: "Approved",
  REVISE: "Revise",
  REJECTED: "Rejected",
};

export const STATUS_ORDER = [
  STATUS.DRAFT,
  STATUS.PENDING,
  STATUS.APPROVED,
  STATUS.REVISE,
  STATUS.REJECTED,
];

// Two-tier approval chain: an approver reviews first, then a manager gives the
// final sign-off. Both stages share STATUS.PENDING ("Pending Approval") — this
// field is what actually tracks whose turn it is.
export const STAGE = {
  APPROVER: "Approver",
  MANAGER: "Manager",
};

export const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export const OBSTRUCTION_TYPES = [
  "Track Maintenance",
  "Signal Work",
  "Vegetation Clearance",
  "Bridge Inspection",
  "Third-Party Works",
  "Equipment Failure",
  "Weather Damage",
  "Other",
];

function readAll() {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read obstruction requests", e);
    return [];
  }
}

function writeAll(requests) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  // notify any listeners in this tab (storage event only fires cross-tab)
  window.dispatchEvent(new CustomEvent("obstructionRequestsChanged"));
}

export function getAllRequests() {
  return readAll();
}

export function getRequestsByRequester(username) {
  return readAll().filter((r) => r.requesterUsername === username);
}

export function getRequestById(id) {
  return readAll().find((r) => r.id === id) || null;
}

function nextRequestId(existing) {
  const year = new Date().getFullYear();
  const countThisYear = existing.filter((r) => r.id.includes(`-${year}-`)).length;
  const seq = String(countThisYear + 1).padStart(4, "0");
  return `OBS-${year}-${seq}`;
}

export function createRequest(data, requesterUsername) {
  const existing = readAll();
  const now = new Date().toISOString();
  const newRequest = {
    id: nextRequestId(existing),
    requesterUsername,
    location: data.location,
    obstructionType: data.obstructionType,
    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,
    reason: data.reason,
    description: data.description,
    priority: data.priority,
    attachmentName: data.attachmentName || null,
    status: data.status,
    stage: data.status === STATUS.PENDING ? STAGE.APPROVER : null,
    createdAt: now,
    updatedAt: now,
    approverComment: null,
    approverUsername: null,
    approverActedByRole: null,
    managerComment: null,
    managerUsername: null,
  };
  const updated = [newRequest, ...existing];
  writeAll(updated);
  return newRequest;
}

export function updateRequestFields(id, fields) {
  const existing = readAll();
  const updated = existing.map((r) =>
    r.id === id ? { ...r, ...fields, updatedAt: new Date().toISOString() } : r
  );
  writeAll(updated);
  return updated.find((r) => r.id === id);
}

export function deleteRequest(id) {
  const existing = readAll();
  writeAll(existing.filter((r) => r.id !== id));
}

// --- derived / computed status helpers ---

export function isActive(request) {
  if (request.status !== STATUS.APPROVED) return false;
  const now = new Date();
  return new Date(request.startDateTime) <= now && now <= new Date(request.endDateTime);
}

export function isUpcoming(request) {
  if (request.status !== STATUS.APPROVED) return false;
  return new Date(request.startDateTime) > new Date();
}

export function isCompleted(request) {
  if (request.status !== STATUS.APPROVED) return false;
  return new Date(request.endDateTime) < new Date();
}

// --- session (very light client-side auth) ---

export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function seedIfEmpty() {
  const existing = readAll();
  if (existing.length > 0) return;

  const now = Date.now();
  const hrs = (n) => new Date(now + n * 3600 * 1000).toISOString();

  const seedData = [
    {
      id: "OBS-2026-0001",
      requesterUsername: "requester",
      location: "Down Main Line — KM 42.3 to 44.1, near Riverside Junction",
      obstructionType: "Track Maintenance",
      startDateTime: hrs(-72),
      endDateTime: hrs(-24),
      reason: "Rail joint replacement",
      description: "Scheduled replacement of worn rail joints identified during last ultrasonic inspection.",
      priority: "Medium",
      attachmentName: "inspection_report_q3.pdf",
      status: STATUS.APPROVED,
      stage: null,
      createdAt: hrs(-200),
      updatedAt: hrs(-190),
      approverComment: "Approved — standard maintenance window, low traffic impact.",
      approverUsername: "approver",
      approverActedByRole: "Approver",
      managerComment: "Final sign-off — no conflicts with the possession calendar.",
      managerUsername: "manager",
    },
    {
      id: "OBS-2026-0002",
      requesterUsername: "requester",
      location: "Up Branch Line — Platform 3 approach, Elmswood Station",
      obstructionType: "Signal Work",
      startDateTime: hrs(-6),
      endDateTime: hrs(18),
      reason: "Signal relay cabinet upgrade",
      description: "Replacing legacy relay interlocking with solid-state interlocking at the Elmswood approach signal.",
      priority: "High",
      attachmentName: "signal_upgrade_plan.pdf",
      status: STATUS.APPROVED,
      stage: null,
      createdAt: hrs(-150),
      updatedAt: hrs(-140),
      approverComment: "Approved on the approver's behalf — urgent signal cutover window. Coordinate with control room 30 min before start.",
      approverUsername: "manager",
      approverActedByRole: "Manager",
      managerComment: "Final sign-off given.",
      managerUsername: "manager",
    },
    {
      id: "OBS-2026-0003",
      requesterUsername: "requester",
      location: "Coastal Line — KM 118.0 to 119.5",
      obstructionType: "Vegetation Clearance",
      startDateTime: hrs(48),
      endDateTime: hrs(60),
      reason: "Overgrowth affecting sightlines",
      description: "Trees and brush along the eastern embankment are obstructing driver sightlines to the KM 119 signal.",
      priority: "Low",
      attachmentName: null,
      status: STATUS.APPROVED,
      stage: null,
      createdAt: hrs(-48),
      updatedAt: hrs(-40),
      approverComment: "Approved, low impact.",
      approverUsername: "approver",
      approverActedByRole: "Approver",
      managerComment: "Agreed, low impact — signed off.",
      managerUsername: "manager",
    },
    {
      id: "OBS-2026-0004",
      requesterUsername: "requester",
      location: "North Freight Yard — Siding 7",
      obstructionType: "Equipment Failure",
      startDateTime: hrs(4),
      endDateTime: hrs(16),
      reason: "Points machine fault",
      description: "Points machine 14B intermittently failing to detect. Requesting possession to replace the unit.",
      priority: "Critical",
      attachmentName: "fault_log_14b.csv",
      status: STATUS.PENDING,
      stage: STAGE.APPROVER,
      createdAt: hrs(-2),
      updatedAt: hrs(-2),
      approverComment: null,
      approverUsername: null,
      approverActedByRole: null,
      managerComment: null,
      managerUsername: null,
    },
    {
      id: "OBS-2026-0005",
      requesterUsername: "requester",
      location: "Down Main Line — Cardwell Tunnel, KM 76",
      obstructionType: "Bridge Inspection",
      startDateTime: hrs(96),
      endDateTime: hrs(104),
      reason: "Annual structural inspection",
      description: "Routine annual inspection of tunnel lining and drainage per asset management schedule.",
      priority: "Medium",
      attachmentName: null,
      status: STATUS.PENDING,
      stage: STAGE.MANAGER,
      createdAt: hrs(-10),
      updatedAt: hrs(-9),
      approverComment: "Looks routine — cleared for the manager's final sign-off.",
      approverUsername: "approver",
      approverActedByRole: "Approver",
      managerComment: null,
      managerUsername: null,
    },
    {
      id: "OBS-2026-0006",
      requesterUsername: "requester",
      location: "West Loop — KM 5.2 to 6.0",
      obstructionType: "Third-Party Works",
      startDateTime: hrs(120),
      endDateTime: hrs(132),
      reason: "Utility company cable crossing",
      description: "Regional utility provider requires possession to lay fibre conduit beneath the track bed.",
      priority: "Low",
      attachmentName: "utility_permit.pdf",
      status: STATUS.REVISE,
      stage: null,
      createdAt: hrs(-30),
      updatedAt: hrs(-20),
      approverComment: "Please confirm the utility company's insurance certificate is current and attach it before resubmitting.",
      approverUsername: "approver",
      approverActedByRole: "Approver",
      managerComment: null,
      managerUsername: null,
    },
    {
      id: "OBS-2026-0007",
      requesterUsername: "requester",
      location: "East Curve — KM 88.7",
      obstructionType: "Weather Damage",
      startDateTime: hrs(-500),
      endDateTime: hrs(-480),
      reason: "Storm debris removal",
      description: "Fallen tree limbs across the up and down lines following the weekend storm system.",
      priority: "High",
      attachmentName: null,
      status: STATUS.REJECTED,
      stage: null,
      createdAt: hrs(-510),
      updatedAt: hrs(-495),
      approverComment: "Looked reasonable to me — passing up for final sign-off.",
      approverUsername: "approver",
      approverActedByRole: "Approver",
      managerComment: "Rejected — duplicate of OBS-2026-0006's crew allocation. Resubmit for the following week once crew is free.",
      managerUsername: "manager",
    },
    {
      id: "OBS-2026-0008",
      requesterUsername: "requester",
      location: "South Yard — Bay 2",
      obstructionType: "Other",
      startDateTime: hrs(200),
      endDateTime: hrs(210),
      reason: "Draft — details pending confirmation from yard supervisor",
      description: "",
      priority: "Low",
      attachmentName: null,
      status: STATUS.DRAFT,
      stage: null,
      createdAt: hrs(-1),
      updatedAt: hrs(-1),
      approverComment: null,
      approverActedByRole: null,
      managerComment: null,
      managerUsername: null,
      approverUsername: null,
    },
  ];

  writeAll(seedData);
}

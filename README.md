# XYZ Corporations — Track Obstruction Request Workflow (POC)

A frontend-only React + Tailwind CSS demo of a rail track obstruction request/approval
workflow. There is no backend: all data lives in the browser's `localStorage`, and
authentication is simulated with two hardcoded accounts.

## Requirements

- Node.js 18+ (Node 20 recommended)
- npm 9+

## Setup

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Demo credentials

| Username     | Password   | Role       |
|--------------|-----------|------------|
| `requester`  | `password` | Requester  |
| `approver`   | `password` | Approver   |

The login screen has one-click buttons that fill these in for you. The "Continue with
SSO" button is visual only and does nothing, as specified.

## What's included

- **Login** (`src/components/Login.jsx`) — client-side credential check, no real auth.
- **Requester dashboard** (`src/components/RequesterDashboard.jsx`) — own requests,
  filterable by status (Draft, Pending Approval, Approved, Changes Required, Rejected).
- **Approver dashboard** (`src/components/ApproverDashboard.jsx`) — everything a
  requester sees, plus:
  - Summary counts (Pending / Active / Completed)
  - A "track timeline" visual plotting approved obstructions along a literal rail line
  - The approval queue (all pending requests, any requester)
  - Upcoming approved obstructions
- **Request form** (`src/components/RequestForm.jsx`) — create/edit, with required-field
  and start/end date validation, save-as-draft vs. submit-for-approval, and a mock
  attachment picker (stores the filename only).
- **Request detail / review** (`src/components/RequestDetail.jsx`) — full request view;
  requesters can edit Draft/Changes-Required requests, approvers can Approve, Reject, or
  Request Changes (a comment is required for the latter two).

All requests are stored as a single array under the `obstructionRequests` key in
`localStorage`; the app seeds a handful of realistic sample requests the first time it
runs so the dashboards aren't empty. Session info lives under `xyzCorpSession`. Clear
your browser's site data (or run `localStorage.clear()` in devtools) to reset the demo.

## Build for production

```bash
npm run build
npm run preview   # serve the production build locally
```

## Tech stack

- React 19 + Vite
- React Router
- Tailwind CSS v4
- No backend, no external API calls — everything is client-side

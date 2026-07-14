# TalentMatch AI — Frontend

Phase 3 deliverable: the complete React frontend for TalentMatch AI, built with mock data
per the project roadmap. This is a real Vite + React project — not a static mockup — so it
becomes the foundation for later phases (Azure architecture, database, backend, deployment).

## Tech Stack

- **React 18** + **Vite** — app shell and dev server
- **React Router v6** — client-side routing, role-protected routes
- **Tailwind CSS** — utility-first styling, themed to the brand palette
- **Recharts** — analytics charts (line, bar, donut)
- **lucide-react** — icon set

## Getting Started

This project was built without internet access in the sandbox that generated it, so
dependencies are **not yet installed**. On your own machine, with Node.js 18+ installed:

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## How to explore it

There's no real backend yet — everything runs on mock data in `src/constants/mockData.js`.
The **Login** page has a role switcher (Candidate / Recruiter / Admin). Pick a role and hit
Login — no real credentials are required at this stage — and you'll land in that role's
dashboard with its own sidebar navigation, pages, and mock data.

## Design System

Following the Frontend Documentation brief (Microsoft-inspired, professional SaaS look):

| Token | Value |
|---|---|
| Primary | `#2563EB` (blue) |
| Secondary | `#14B8A6` (teal) |
| Success | Green |
| Danger | Red |
| Background | Light gray (`#F8FAFC`) |
| Cards | White, `12px` radius, soft shadow |
| Display font | Poppins |
| Body font | Inter |

**Signature element:** the `MatchRing` component (`src/components/common/MatchRing.jsx`) —
a circular AI match-score indicator that appears on job cards, candidate cards, and detail
pages throughout the app. Since the whole product is built around AI matching, this ring is
the one visual idea that ties every screen together, color-coded by score band (blue → teal
→ amber → red).

## Folder Structure

```
src/
├── assets/
├── components/
│   ├── common/       Button, Card, Badge, Modal, Toast, MatchRing, FileUpload, etc.
│   ├── layout/        Navbar, Sidebar, Footer, DashboardLayout, PublicLayout
│   ├── forms/         FormField
│   ├── dashboard/      StatCard, NotificationsPanel, SettingsPanel, UserManagementTable
│   ├── charts/         Trend line, bar, and donut chart wrappers (Recharts)
│   └── tables/         DataTable
├── pages/
│   ├── public/         Landing, About, Features, Pricing, Contact, Login, Register,
│   │                    Forgot Password, Privacy, Terms, 404
│   ├── candidate/       Dashboard, Browse Jobs, Job Details, Resume Upload, Applications,
│   │                    Profile, Notifications, Settings
│   ├── recruiter/        Dashboard, Manage Jobs, Create Job, Candidates, Candidate Details,
│   │                    Analytics, Notifications, Settings
│   └── admin/           Dashboard, Users, Recruiters, Candidates, Jobs, Audit Logs, Settings
├── routes/              ProtectedRoute (role-based route guard)
├── services/            mockApi.js — swap this for real REST calls in a later phase
├── hooks/                useAuth
├── context/              AuthContext (mock session state)
├── utils/                formatters (score colors, status badges)
├── constants/            mockData.js, navigation.js
├── App.jsx
└── main.jsx
```

## Responsive Design

Every page is responsive from mobile through desktop. The dashboard sidebar collapses
behind a hamburger menu below the `lg` breakpoint; grids and tables reflow at `sm`/`md`.

## What's mocked vs. real

- All data (jobs, candidates, applications, notifications, users, audit logs, analytics)
  lives in `src/constants/mockData.js`.
- `src/services/mockApi.js` wraps that data in `Promise`-returning functions so the
  components already call an "API" the same way they will once a real backend exists —
  only the implementation inside `mockApi.js` will need to change later.
- Authentication is a simple role switcher with no real password check (`AuthContext.jsx`).

## Next steps (per the project roadmap)

This completes **Phase 3 — Frontend Development**. Phase 4 begins Azure solution
architecture and planning for the real backend, database, and AI services this frontend
will eventually connect to.

Deployed via GitHub Actions
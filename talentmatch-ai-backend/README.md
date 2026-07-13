# TalentMatch AI — Backend (Phase 7)

Node.js + Express REST API, connected to the Azure SQL database from Phase 6.

**Modules built so far:**
1. Authentication (register, login, logout, forgot-password stub, `/me`)
2. User Management (profile, password change, education/experience/certifications/projects/skills/languages CRUD, notifications, admin user management)

Job Management, Resume Management, Candidate Management, Dashboard APIs, and
Analytics APIs come next, one at a time.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` with your real values:
- `SQL_SERVER` — from Phase 5, e.g. `sql-talentmatch-11052.database.windows.net`
- `SQL_PASSWORD` — the SQL admin password you set
- `JWT_SECRET` — generate one with `openssl rand -hex 64` (Cloud Shell or any terminal with OpenSSL)

Then run it:

```bash
npm run dev
```

You should see:
```
Connected to Azure SQL: talentmatchdb
TalentMatch AI backend running on http://localhost:5000
```

If the SQL connection fails, double check your Azure SQL firewall rules allow
your current IP (same `AllowMyIP` rule from the Phase 5 script — your IP may
have changed since then if you're on a different network).

## Endpoints in Module 1 (Authentication)

| Method | Route | Auth required | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create a Candidate or Recruiter account |
| POST | `/api/auth/login` | No | Authenticate, returns a JWT |
| POST | `/api/auth/logout` | No | Stateless — frontend just discards the token |
| POST | `/api/auth/forgot-password` | No | Stubbed — logs to console, no real email yet |
| GET | `/api/auth/me` | Yes (Bearer token) | Returns the current user's profile |

## Endpoints in Module 2 (User Management)

| Method | Route | Role required | Purpose |
|---|---|---|---|
| GET | `/api/users/me/profile` | Any logged in | Full profile (candidate or recruiter shape) |
| PUT | `/api/users/me/profile` | Any logged in | Update name + role-specific fields |
| PUT | `/api/users/me/password` | Any logged in | Change password (requires current password) |
| GET/POST | `/api/users/me/education` | Candidate | List / add education entries |
| PUT/DELETE | `/api/users/me/education/:id` | Candidate | Update / remove one entry |
| GET/POST | `/api/users/me/experience` | Candidate | Same pattern as education |
| GET/POST | `/api/users/me/certifications` | Candidate | Same pattern |
| GET/POST | `/api/users/me/projects` | Candidate | Same pattern |
| GET/POST | `/api/users/me/skills` | Candidate | List / add a skill by name (creates it if new) |
| DELETE | `/api/users/me/skills/:skillId` | Candidate | Remove a skill from your profile |
| GET/POST | `/api/users/me/languages` | Candidate | Same pattern as skills, plus proficiency |
| DELETE | `/api/users/me/languages/:languageId` | Candidate | Remove a language |
| GET | `/api/notifications` | Any logged in | List your notifications |
| PATCH | `/api/notifications/:id/read` | Any logged in | Mark one as read |
| PATCH | `/api/notifications/read-all` | Any logged in | Mark all as read |
| GET | `/api/admin/users` | Admin | List all users (`?role=`, `?search=`, `?page=`) |
| PATCH | `/api/admin/users/:id/status` | Admin | Suspend or reactivate a user |

## Testing Module 2

All of these need a token from `/api/auth/login` in the `Authorization: Bearer <token>` header. Using PowerShell syntax (see Module 1 section above for the quote-escaping difference vs. bash/Mac).

**Get your full profile:**
```powershell
curl.exe http://localhost:5000/api/users/me/profile -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

**Update your profile:**
```powershell
curl.exe -X PUT http://localhost:5000/api/users/me/profile -H "Authorization: Bearer PASTE_TOKEN_HERE" -H "Content-Type: application/json" -d '{"fullName": "Amina Yousafzai", "title": "Frontend Developer", "location": "Toronto, ON", "bio": "4 years building React applications."}'
```

**Add an education entry:**
```powershell
curl.exe -X POST http://localhost:5000/api/users/me/education -H "Authorization: Bearer PASTE_TOKEN_HERE" -H "Content-Type: application/json" -d '{"Institution": "George Brown College", "Degree": "Postgraduate Certificate", "FieldOfStudy": "Cloud Computing", "StartDate": "2025-09-01", "EndDate": "2026-08-01"}'
```

**Add a skill:**
```powershell
curl.exe -X POST http://localhost:5000/api/users/me/skills -H "Authorization: Bearer PASTE_TOKEN_HERE" -H "Content-Type: application/json" -d '{"name": "React"}'
```

**List your skills:**
```powershell
curl.exe http://localhost:5000/api/users/me/skills -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

**Admin: list all users** (you'll need to log in as an Admin-role user for this — none exist yet unless you manually insert one into the Users table with Role='Admin', since Admins can't self-register):
```powershell
curl.exe http://localhost:5000/api/admin/users -H "Authorization: Bearer PASTE_ADMIN_TOKEN_HERE"
```

## Design decisions worth knowing (Module 2)

- **Education / Experience / Certifications / Projects share one factory** (`candidateSubResourceFactory.js`) instead of four nearly-identical model files — they're structurally the same (a simple list owned by one candidate), so one reusable factory builds all four.
- **Skills and Languages use a "find or create" pattern** — adding "React" to your profile reuses the existing Skills row if another candidate or job already has it, rather than creating duplicates. This is what makes the master list actually work as a master list.
- **Ownership checks everywhere** — updating or deleting an education entry (etc.) always filters by both the record's `Id` AND the logged-in user's `CandidateId`. This is what stops candidate A from editing candidate B's data by guessing an ID number.
- **Admins can't suspend themselves** — a small guard in `adminUserController.js` prevents an admin from locking themselves out by accident.
- **There's no admin registration endpoint** — matching Module 1's decision that Admin accounts aren't self-service. To create your first Admin account for testing, you'll need to manually update a user's role directly in the database (see below).

## Creating an Admin account for testing

Since Admins can't self-register, register a normal account first (Candidate or Recruiter), then promote it directly in Azure SQL Query Editor:

```sql
UPDATE Users SET Role = 'Admin' WHERE Email = 'youremail@example.com';
```

Note: if that user already had a Candidates or Recruiters row created at registration, it'll be left in place (harmless, just unused) — this is a manual testing shortcut, not how Admin accounts should be created in a real deployment.


## Testing it manually

**Register a candidate:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Amina Yousafzai",
    "email": "amina@example.com",
    "password": "TestPass123",
    "role": "Candidate"
  }'
```

**Register a recruiter** (note the extra `companyName` field):
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Michael Chen",
    "email": "michael@northbridge.io",
    "password": "TestPass123",
    "role": "Recruiter",
    "companyName": "Northbridge Technologies"
  }'
```

Both should return a `201` with a `token` and `user` object.

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "amina@example.com", "password": "TestPass123"}'
```

**Call the protected `/me` route** (replace `<TOKEN>` with the token from login/register):
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

Without a token, or with a bad one, this should return `401`.

## Design decisions worth knowing

- **Passwords** are hashed with bcrypt (12 salt rounds) — never stored or logged in plain text.
- **JWTs** carry only `{ userId, role }` — nothing sensitive, and nothing the frontend needs is baked into the token beyond what authorization checks require. Everything else comes from `/auth/me`.
- **Login errors are intentionally vague** — "Invalid email or password" whether the email doesn't exist or the password is wrong. Distinguishing the two would let someone enumerate registered emails.
- **Admins are not self-registerable** — the `/register` endpoint only accepts `Candidate` or `Recruiter`. Admin accounts get created directly in the database (or via a future admin-only endpoint), matching the idea that platform admins aren't a public signup path.
- **Forgot Password is stubbed** — it validates the email and returns a generic response either way (so it doesn't leak which emails are registered), but doesn't send a real email yet. Wiring up Azure Communication Services (or similar) for real email delivery is a later task, not part of this module.

## What's NOT in this module yet

- Real password reset (needs an email service)
- Refresh tokens / token revocation (current JWTs are stateless and simply expire after `JWT_EXPIRES_IN`)
- Rate limiting on login/register (worth adding before this goes to production — repeated failed logins aren't currently throttled)

## A note on testing

I wrote and syntax-checked every file in this module (bundled it with esbuild
to confirm there are no broken imports), but I have no way to run Node.js
against a live Azure SQL database from my sandbox — no outbound network
access. So this has **not** been executed end-to-end by me. Run through the
curl commands above yourself and tell me exactly what breaks, if anything —
that's the real test.

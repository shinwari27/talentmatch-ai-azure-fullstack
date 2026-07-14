# TalentMatch AI

**An AI-powered recruitment platform that matches candidates to jobs using a transparent, weighted scoring engine — built end-to-end on Azure, from resume parsing to automated deployment.**

Candidates upload a resume; Azure AI Document Intelligence extracts their skills, education, experience, certifications, and projects. Recruiters post jobs with real requirements. A custom matching engine scores every application across six weighted categories and shows exactly *why* a candidate got the score they did — not just a bare percentage.

---

## Live Demo

- **Frontend:** [app-talentmatch-web-11052.azurewebsites.net](https://app-talentmatch-web-11052.azurewebsites.net)
- **Backend API health check:** [app-talentmatch-api-11052.azurewebsites.net/health](https://app-talentmatch-api-11052.azurewebsites.net/health)

*(Demo accounts and a walkthrough script are in [`Documentation/Demo-Script.md`](./Documentation).)*

---

## Why This Project

Most portfolio "job board" projects stop at CRUD — post a job, apply to a job. TalentMatch AI goes further: it actually tries to answer the question a real recruiter asks — *how well does this person actually fit this role, and why?*

That meant building a genuine scoring algorithm (not a keyword-count gimmick), being honest about what AI extraction can and can't reliably do, and being transparent enough that both a candidate and a recruiter can see the reasoning behind every score.

---

## Core Features

### For Candidates
- Resume upload with automated parsing (skills, certifications, languages, education, experience, projects) via Azure AI Document Intelligence
- A completeness score reflecting how much structured data was confidently extracted
- Real-time match scores against every job applied to, with a full breakdown modal (per-category score, missing skills, plain-language reasons)
- "Improve Your Match" recommendations aggregated from missing skills across all applications
- Self-service score recalculation after updating a profile

### For Recruiters
- Job posting with structured requirements (skills, certifications, languages, experience range, education)
- Candidate pipeline with real match scores, sortable and filterable
- One-click "Rank Candidates" to recalculate scores for every applicant to a job
- Analytics dashboard: application trends, skill distribution, hiring funnel, match-score statistics per job and in aggregate

### For Admins
- User and platform management, audit logging, suspension controls

### Platform-Wide
- Automated job expiration (Azure Functions timer trigger, no manual intervention)
- In-app notifications on real events (new applications, status changes, resume processed)
- Rate limiting on every brute-force-sensitive endpoint
- Real exception and usage telemetry via Application Insights

---

## The Matching Engine

Six weighted categories, with graceful degradation when a job doesn't specify a requirement:

| Category | Weight | How it's scored |
|---|---|---|
| Skills | 40% | Matched live against the candidate's actual resume text — not a static dictionary snapshot |
| Experience | 25% | Years calculated from verified work history vs. the job's required range |
| Education | 10% | Degree level + field-of-study overlap |
| Certifications | 10% | Matched against a normalized certification catalog |
| Projects | 10% | Project descriptions checked for the job's required skills |
| Languages | 5% | Matched against a normalized language catalog |

If a job doesn't specify, say, preferred languages, that 5% doesn't count against the candidate — the remaining categories' weights scale up proportionally to fill the difference. Every score comes with a full breakdown showing exactly which categories applied, which didn't, and why.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | Azure SQL Database |
| File Storage | Azure Blob Storage |
| AI / Document Processing | Azure AI Document Intelligence |
| Background Jobs | Azure Functions (timer trigger) |
| Authentication | JWT, bcrypt |
| Secrets Management | Azure Key Vault + Managed Identity |
| Monitoring | Application Insights, Azure Monitor |
| Testing | Jest (backend + frontend) |
| CI/CD | GitHub Actions |
| Hosting | Azure App Service |

---

## Architecture

```
talentmatch-ai-azure-fullstack/
├── talentmatch-ai-backend/     Node/Express API, matching engine, resume parser
├── talentmatch-ai-frontend/    React SPA (candidate, recruiter, admin dashboards)
├── talentmatch-ai-functions/   Azure Functions — scheduled job expiration
├── talentmatch-ai-infra/       Azure provisioning scripts
├── .github/workflows/          CI/CD — automated test + deploy per project
└── Documentation/              Full technical + user documentation
```

Full diagrams: [`Documentation/Architecture-Diagram.png`](./Documentation) · [`Documentation/ER-Diagram.png`](./Documentation)

---

## Getting Started

Each project is independent — install and run separately.

```bash
# Backend
cd talentmatch-ai-backend
npm install
cp .env.example .env   # fill in your own Azure SQL / Storage / Document Intelligence credentials
npm run dev

# Frontend
cd talentmatch-ai-frontend
npm install
npm run dev
```

Full setup, including Azure resource provisioning, is documented in [`Documentation/Deployment-Guide.md`](./Documentation).

## Running Tests

```bash
cd talentmatch-ai-backend && npm test
cd talentmatch-ai-frontend && npm test
```

CI/CD runs the full suite automatically on every push — a failing test blocks deployment.

---

## Documentation

Full technical and user documentation lives in [`/Documentation`](./Documentation), including:
- Software Requirements Specification, High/Low-Level Design
- API and Database documentation
- Deployment and Security guides
- Testing report
- Admin, Recruiter, and Candidate user guides

---

## Author

**Hikmat Shinwari**
Cloud/DevOps & IT Support professional — [LinkedIn](https://www.linkedin.com/in/hikmat-shinwari-368826287/) · [GitHub](https://github.com/shinwari27)

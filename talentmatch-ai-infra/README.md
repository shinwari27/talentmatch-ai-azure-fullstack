# TalentMatch AI — Phase 5: Azure Environment Setup

Azure CLI scripts to provision the cloud environment, per the project roadmap's
Phase 5 (Resource Group, Storage, SQL Database, App Services, networking,
identities, Key Vault).

## Prerequisites

- An active Azure subscription (Free/Student trial is fine — this script uses
  cost-conscious SKUs: Basic App Service Plan, Serverless SQL with 60-min
  auto-pause, Standard LRS storage).
- Azure CLI. Easiest path: use **Azure Cloud Shell** at https://shell.azure.com
  (already logged in, Azure CLI pre-installed, nothing to set up locally).
  If you'd rather run it locally, install the CLI and run `az login` first.

## Before you run it

Open `01-provision-azure.sh` and change this line to a real password:

```bash
SQL_ADMIN_PASSWORD="ChangeMe#2026!"
```

Azure SQL requires 8+ characters with at least 3 of: uppercase, lowercase,
numbers, symbols. Don't reuse a password from anywhere else, and don't commit
this file to GitHub with a real password in it — that's what Key Vault is
for once the app is running (this script already wires the connection string
into Key Vault rather than leaving it as a plain app setting).

## Running it

```bash
chmod +x 01-provision-azure.sh
./01-provision-azure.sh
```

Takes roughly 5-10 minutes — SQL Server and Key Vault provisioning are the
slowest steps. The script prints a summary at the end with all the resource
names and URLs — save that output, you'll need it for later phases and for
your Phase 5 documentation.

## What gets created

| Resource | Purpose |
|---|---|
| Resource Group (`rg-talentmatch-ai`) | Container for everything below |
| Storage Account + `resumes` container | Blob storage for uploaded resumes |
| SQL Server + `talentmatchdb` database | Relational data (users, jobs, applications) |
| Key Vault | Holds the SQL connection string and storage key as secrets |
| App Service Plan (B1, Linux) | Compute for both web apps |
| Backend App Service | Will host the Node.js/Express API (Phase 7+) |
| Frontend App Service | Will host the built React app |
| Managed Identity (backend) | Lets the backend read Key Vault secrets without a stored password |

## Cost note

A Free/Student trial gives you credit, not unlimited resources — the B1 App
Service Plan and serverless SQL database both cost money once your free
credit runs out or after the trial period ends. When you're not actively
working:

- SQL auto-pauses after 60 minutes of inactivity (near-zero cost while paused)
- If you want to stop everything, run `02-teardown.sh` and re-provision later
  — re-running `01-provision-azure.sh` takes a few minutes and gives you a
  clean environment again (note: it generates new random resource name
  suffixes each time, so treat re-runs as a fresh environment, not a resume)

## Screenshot checklist for your documentation (Phase 5)

Once the script finishes successfully:

- Azure Portal → Resource Groups → `rg-talentmatch-ai` (shows all resources listed)
- Storage Account → Containers (shows the `resumes` container)
- SQL Server → Databases (shows `talentmatchdb`)
- Key Vault → Secrets (shows `SqlConnectionString` and `StorageAccountKey` — names only, don't screenshot the actual values)
- App Services (both frontend and backend) → Overview page, showing status "Running" and the default URL
- Backend App Service → Identity → shows System-assigned identity "On"
- The terminal output summary block at the end of the script run

# TalentMatch AI — Azure Functions (Phase 13, Step 2)

A separate Azure resource from your main backend — Functions exist for
*scheduled/background* work, which App Service (your Express backend) isn't
built for; it only responds to HTTP requests.

**What's in here:** one timer-triggered function, `expireOldJobs`, that runs
daily and automatically closes any job posting still marked "Open" after
30 days (configurable). This is the first genuinely unattended, scheduled
piece of the whole project — everything before this only ran because a
user clicked something.

## Prerequisites

1. **Node.js 18+** (you already have this)
2. **Azure Functions Core Tools** — install globally:
   ```powershell
   npm install -g azure-functions-core-tools@4 --unsafe-perm true
   ```
3. **(Recommended) VS Code Azure Functions extension** — search "Azure
   Functions" in the VS Code Extensions panel. Makes deployment a couple of
   clicks instead of CLI commands, and you're already using VS Code for
   everything else.

## Provisioning the Azure resource

Run `provision-function-app.sh` in Cloud Shell (Bash mode). It creates:
- A **Consumption plan** Function App — you're only billed when the
  function actually runs (once a day, a few seconds each time — this will
  cost close to nothing)
- Reuses your **existing storage account** from Phase 5 (Functions require
  one for their own bookkeeping; no need to pay for a second)

**One thing the script deliberately skips:** your SQL password isn't set via
the main script (so it doesn't linger in your Cloud Shell command history).
The script prints the follow-up command to run separately — do that right
after.

## Local setup

```bash
cp local.settings.json.example local.settings.json
npm install
```

Edit `local.settings.json` with your real values:
- `SQL_SERVER`, `SQL_DATABASE`, `SQL_USER`, `SQL_PASSWORD` — same as your backend's `.env`
- `AzureWebJobsStorage` — your storage account's **connection string** (Portal → Storage Account → Access keys → Connection string), not just the account name
- `JOB_EXPIRATION_DAYS` — how many days an Open job sits before auto-closing (default 30)

## Testing locally

```bash
npm start
```

This starts the Functions runtime locally. A timer-triggered function
doesn't run immediately on `npm start` — it waits for its schedule. To test
it right now instead of waiting for 2 AM, temporarily change the schedule
in `src/functions/expireOldJobs.js` to something like `"0 */1 * * * *"`
(every minute) — **remember to change it back to `"0 0 2 * * *"` before
deploying for real.**

You should see console output listing which jobs it found and closed. Check
your database afterward:
```sql
SELECT Id, Title, Status, PostedAt, ClosedAt FROM Jobs WHERE Status = 'Closed';
```

## Deploying to Azure

**Option A — VS Code extension (easier):**
1. Click the Azure icon in the VS Code sidebar
2. Under "Workspace," right-click your Functions project → **Deploy to Function App**
3. Select the Function App you provisioned (`func-talentmatch-11052`)
4. Confirm when prompted

**Option B — Azure Functions Core Tools CLI:**
```bash
func azure functionapp publish func-talentmatch-11052
```

Either way, once deployed, the function runs on Azure's schedule
automatically — nothing else to start or keep running, unlike your backend
which needs `npm run dev` active.

## Verifying it's actually running on a schedule

Portal → your Function App → **Functions** → `expireOldJobs` → **Monitor**
tab shows a log of every invocation, whether it succeeded, and how long it
took. This is also where you'd look if you ever suspect it silently stopped
running.

## Screenshot checklist for documentation

- Function App Overview page in the Portal
- The `expireOldJobs` function's Monitor tab showing at least one successful invocation
- A `SELECT` query result showing a job that got auto-closed, with its `ClosedAt` timestamp

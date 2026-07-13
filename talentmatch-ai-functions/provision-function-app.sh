#!/bin/bash
# ==============================================================================
# TalentMatch AI — Phase 13, Step 2: Provision Azure Function App
# ==============================================================================
# Run in Cloud Shell (Bash mode — same lesson from Phase 5: make sure the
# top-left switcher says Bash, not PowerShell, before pasting this).
#
# Reuses your existing storage account for the Function App's own runtime
# needs (Functions requires one; there's no reason to pay for a second).
# ==============================================================================

RESOURCE_GROUP="rg-talentmatch-ai"
LOCATION="canadacentral"
STORAGE_ACCOUNT="sttalentmatch11052"   # your existing storage account from Phase 5
FUNCTION_APP_NAME="func-talentmatch-11052"   # change the suffix if this name is taken (must be globally unique)

echo "--> Creating the Function App (Consumption plan — pay only when it runs)..."
az functionapp create \
  --resource-group "$RESOURCE_GROUP" \
  --consumption-plan-location "$LOCATION" \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --name "$FUNCTION_APP_NAME" \
  --storage-account "$STORAGE_ACCOUNT" \
  --os-type Linux

echo ""
echo "--> Setting SQL connection app settings..."
az functionapp config appsettings set \
  --name "$FUNCTION_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    "SQL_SERVER=sql-talentmatch-11052.database.windows.net" \
    "SQL_DATABASE=talentmatchdb" \
    "SQL_USER=talentmatchadmin" \
    "JOB_EXPIRATION_DAYS=30"

echo ""
echo "=============================================="
echo " Function App created: $FUNCTION_APP_NAME"
echo "=============================================="
echo "IMPORTANT: SQL_PASSWORD was deliberately left out of the command above"
echo "so it doesn't sit in your Cloud Shell history. Set it separately:"
echo ""
echo "az functionapp config appsettings set --name $FUNCTION_APP_NAME \\"
echo "  --resource-group $RESOURCE_GROUP --settings SQL_PASSWORD='YourActualPassword'"
echo ""
echo "Next: deploy your function code — see README.md for the two options"
echo "(VS Code extension, or the Azure Functions Core Tools CLI)."
echo "=============================================="

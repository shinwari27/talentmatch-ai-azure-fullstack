#!/bin/bash
# ==============================================================================
# TalentMatch AI — Phase 5: Azure Environment Setup
# ==============================================================================
# Run this in Azure Cloud Shell (Bash) — https://shell.azure.com — or any
# machine with Azure CLI installed and `az login` already done.
#
# This script is idempotent-ish (safe to re-run), but if a resource already
# exists with different settings, Azure will just report it unchanged or error
# on conflicting properties. Read each section before running blind.
#
# Sized for a Free/Student Azure subscription: cheapest SKUs that still work
# (Basic App Service Plan, Serverless SQL, Standard LRS Storage, Standard
# Key Vault). Change SKUs later once you're off the trial.
# ==============================================================================

set -e  # stop on first error

# ------------------------------------------------------------------------------
# 1. VARIABLES — edit these before running
# ------------------------------------------------------------------------------
LOCATION="canadacentral"
RESOURCE_GROUP="rg-talentmatch-ai"

# Must be globally unique across ALL of Azure — the script appends a random
# suffix so you don't have to think about it.
SUFFIX=$RANDOM
STORAGE_ACCOUNT="sttalentmatch${SUFFIX}"
SQL_SERVER_NAME="sql-talentmatch-${SUFFIX}"
KEY_VAULT_NAME="kv-talentmatch-${SUFFIX}"
APP_SERVICE_PLAN="asp-talentmatch-ai"
BACKEND_APP_NAME="app-talentmatch-api-${SUFFIX}"
FRONTEND_APP_NAME="app-talentmatch-web-${SUFFIX}"

SQL_DB_NAME="talentmatchdb"
SQL_ADMIN_USER="talentmatchadmin"
# CHANGE THIS before running — don't leave a placeholder password in real use.
SQL_ADMIN_PASSWORD="Shinwari27"

BLOB_CONTAINER_RESUMES="resumes"

echo "=============================================="
echo " TalentMatch AI — Phase 5 Provisioning"
echo " Resource Group: $RESOURCE_GROUP"
echo " Region:         $LOCATION"
echo "=============================================="

# ------------------------------------------------------------------------------
# 2. RESOURCE GROUP
# ------------------------------------------------------------------------------
echo ""
echo "--> Creating resource group..."
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION"

# ------------------------------------------------------------------------------
# 3. STORAGE ACCOUNT + BLOB CONTAINER (resume storage)
# ------------------------------------------------------------------------------
echo ""
echo "--> Creating storage account..."
az storage account create \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --kind StorageV2 \
  --min-tls-version TLS1_2 \
  --allow-blob-public-access false

echo "--> Creating blob container for resumes..."
STORAGE_KEY=$(az storage account keys list \
  --account-name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --query "[0].value" -o tsv)

az storage container create \
  --name "$BLOB_CONTAINER_RESUMES" \
  --account-name "$STORAGE_ACCOUNT" \
  --account-key "$STORAGE_KEY" \
  --public-access off

# ------------------------------------------------------------------------------
# 4. AZURE SQL — SERVER + DATABASE
# ------------------------------------------------------------------------------
echo ""
echo "--> Creating SQL logical server..."
az sql server create \
  --name "$SQL_SERVER_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --admin-user "$SQL_ADMIN_USER" \
  --admin-password "$SQL_ADMIN_PASSWORD"

echo "--> Allowing Azure services to reach the SQL server..."
az sql server firewall-rule create \
  --resource-group "$RESOURCE_GROUP" \
  --server "$SQL_SERVER_NAME" \
  --name "AllowAzureServices" \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

echo "--> (Optional) Allowing your current IP to connect for local dev/admin..."
MY_IP=$(curl -s https://api.ipify.org || echo "")
if [ -n "$MY_IP" ]; then
  az sql server firewall-rule create \
    --resource-group "$RESOURCE_GROUP" \
    --server "$SQL_SERVER_NAME" \
    --name "AllowMyIP" \
    --start-ip-address "$MY_IP" \
    --end-ip-address "$MY_IP"
else
  echo "    Could not detect your IP automatically — add a firewall rule manually if needed."
fi

echo "--> Creating the database (serverless, auto-pauses to save cost on a trial)..."
az sql db create \
  --resource-group "$RESOURCE_GROUP" \
  --server "$SQL_SERVER_NAME" \
  --name "$SQL_DB_NAME" \
  --edition GeneralPurpose \
  --family Gen5 \
  --capacity 1 \
  --compute-model Serverless \
  --auto-pause-delay 60 \
  --zone-redundant false

# ------------------------------------------------------------------------------
# 5. KEY VAULT
# ------------------------------------------------------------------------------
echo ""
echo "--> Creating Key Vault..."
az keyvault create \
  --name "$KEY_VAULT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku standard \
  --enable-rbac-authorization true

echo "--> Storing SQL connection details as secrets..."
SQL_CONNECTION_STRING="Server=tcp:${SQL_SERVER_NAME}.database.windows.net,1433;Database=${SQL_DB_NAME};User ID=${SQL_ADMIN_USER};Password=${SQL_ADMIN_PASSWORD};Encrypt=true;Connection Timeout=30;"

az keyvault secret set \
  --vault-name "$KEY_VAULT_NAME" \
  --name "SqlConnectionString" \
  --value "$SQL_CONNECTION_STRING"

az keyvault secret set \
  --vault-name "$KEY_VAULT_NAME" \
  --name "StorageAccountKey" \
  --value "$STORAGE_KEY"

# ------------------------------------------------------------------------------
# 6. APP SERVICE PLAN + APP SERVICES (frontend + backend)
# ------------------------------------------------------------------------------
echo ""
echo "--> Creating App Service Plan (Linux, Basic tier)..."
az appservice plan create \
  --name "$APP_SERVICE_PLAN" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku B1 \
  --is-linux

echo "--> Creating backend App Service (Node.js 20 LTS)..."
az webapp create \
  --name "$BACKEND_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$APP_SERVICE_PLAN" \
  --runtime "NODE:20-lts"

echo "--> Creating frontend App Service (static React build, Node runtime to serve it)..."
az webapp create \
  --name "$FRONTEND_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$APP_SERVICE_PLAN" \
  --runtime "NODE:20-lts"

# ------------------------------------------------------------------------------
# 7. MANAGED IDENTITIES + KEY VAULT ACCESS (RBAC)
# ------------------------------------------------------------------------------
echo ""
echo "--> Enabling system-assigned managed identity on the backend App Service..."
az webapp identity assign \
  --name "$BACKEND_APP_NAME" \
  --resource-group "$RESOURCE_GROUP"

BACKEND_PRINCIPAL_ID=$(az webapp identity show \
  --name "$BACKEND_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query principalId -o tsv)

KEY_VAULT_ID=$(az keyvault show \
  --name "$KEY_VAULT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query id -o tsv)

echo "--> Granting the backend's managed identity 'Key Vault Secrets User' access..."
az role assignment create \
  --assignee "$BACKEND_PRINCIPAL_ID" \
  --role "Key Vault Secrets User" \
  --scope "$KEY_VAULT_ID"

# ------------------------------------------------------------------------------
# 8. APP SETTINGS (point the backend at Key Vault references, not raw secrets)
# ------------------------------------------------------------------------------
echo ""
echo "--> Wiring backend app settings to Key Vault references..."
az webapp config appsettings set \
  --name "$BACKEND_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    "SQL_CONNECTION_STRING=@Microsoft.KeyVault(SecretUri=https://${KEY_VAULT_NAME}.vault.azure.net/secrets/SqlConnectionString/)" \
    "STORAGE_ACCOUNT_NAME=${STORAGE_ACCOUNT}" \
    "STORAGE_ACCOUNT_KEY=@Microsoft.KeyVault(SecretUri=https://${KEY_VAULT_NAME}.vault.azure.net/secrets/StorageAccountKey/)" \
    "BLOB_CONTAINER_RESUMES=${BLOB_CONTAINER_RESUMES}"

# ------------------------------------------------------------------------------
# 9. SUMMARY
# ------------------------------------------------------------------------------
echo ""
echo "=============================================="
echo " PROVISIONING COMPLETE — save this output"
echo "=============================================="
echo "Resource Group:       $RESOURCE_GROUP"
echo "Storage Account:      $STORAGE_ACCOUNT"
echo "Blob Container:       $BLOB_CONTAINER_RESUMES"
echo "SQL Server:           ${SQL_SERVER_NAME}.database.windows.net"
echo "SQL Database:         $SQL_DB_NAME"
echo "SQL Admin User:       $SQL_ADMIN_USER"
echo "Key Vault:            $KEY_VAULT_NAME"
echo "App Service Plan:     $APP_SERVICE_PLAN (B1, Linux)"
echo "Backend App URL:      https://${BACKEND_APP_NAME}.azurewebsites.net"
echo "Frontend App URL:     https://${FRONTEND_APP_NAME}.azurewebsites.net"
echo "=============================================="
echo ""
echo "IMPORTANT: change SQL_ADMIN_PASSWORD in this script before running,"
echo "and never commit real credentials to GitHub."

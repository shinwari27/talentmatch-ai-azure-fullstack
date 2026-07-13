#!/bin/bash
# ==============================================================================
# TalentMatch AI — Teardown script
# ==============================================================================
# Deletes the entire resource group and everything in it. Use this to avoid
# burning through free-trial credit when you're done working for the day,
# or to start over cleanly if something got misconfigured.
#
# THIS IS DESTRUCTIVE AND IRREVERSIBLE. Double-check the resource group name.
# ==============================================================================

RESOURCE_GROUP="rg-talentmatch-ai"

echo "This will permanently delete the resource group: $RESOURCE_GROUP"
echo "and everything inside it (storage, SQL, App Services, Key Vault)."
read -p "Type the resource group name to confirm: " CONFIRM

if [ "$CONFIRM" == "$RESOURCE_GROUP" ]; then
  az group delete --name "$RESOURCE_GROUP" --yes --no-wait
  echo "Deletion started (running in the background). Check the portal to confirm it completes."
else
  echo "Confirmation did not match. Aborted — nothing was deleted."
fi

#!/bin/bash
set -e

PROJECT_ID="remote-worksio"
SERVICE_ACCOUNT="github-actions"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "=================================================================="
echo "Verify and Create Service Account for Cloud Run"
echo "=================================================================="
echo ""
echo "Project: $PROJECT_ID"
echo "Service Account: $SERVICE_ACCOUNT_EMAIL"
echo ""

# Check if service account exists
echo "Checking if service account exists..."
if gcloud iam service-accounts describe "$SERVICE_ACCOUNT_EMAIL" --project="$PROJECT_ID" &>/dev/null; then
  echo "✓ Service account already exists: $SERVICE_ACCOUNT_EMAIL"
else
  echo "⚠ Service account does not exist. Creating it now..."

  gcloud iam service-accounts create "$SERVICE_ACCOUNT" \
    --display-name="GitHub Actions Service Account" \
    --description="Service account for Cloud Run services deployed via GitHub Actions" \
    --project="$PROJECT_ID"

  echo "✓ Created service account: $SERVICE_ACCOUNT_EMAIL"
fi

echo ""
echo "=================================================================="
echo "Service Account Status"
echo "=================================================================="
echo ""

# Show service account details
gcloud iam service-accounts describe "$SERVICE_ACCOUNT_EMAIL" --project="$PROJECT_ID"

echo ""
echo "=================================================================="
echo "✓ Service account is ready!"
echo ""
echo "Next steps:"
echo "  1. Run ./grant-direct-wif-permissions.sh to grant all permissions"
echo "  2. Wait 5 minutes for IAM changes to propagate"
echo "  3. Retry your GitHub Actions deployment"
echo "=================================================================="

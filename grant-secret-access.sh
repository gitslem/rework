#!/bin/bash
set -e

# Script to grant Secret Manager access to the GitHub Actions service account
# This fixes the Cloud Run deployment error where the service account can't access secrets

echo "==================================================================="
echo "Grant Secret Manager Access to GitHub Actions Service Account"
echo "==================================================================="
echo ""

# Get project ID from gcloud config or use provided value
if [ -z "$1" ]; then
  PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
  if [ -z "$PROJECT_ID" ]; then
    echo "Error: No project ID found. Please provide it as an argument:"
    echo "  ./grant-secret-access.sh YOUR_PROJECT_ID"
    exit 1
  fi
  echo "Using project from gcloud config: $PROJECT_ID"
else
  PROJECT_ID="$1"
  echo "Using provided project: $PROJECT_ID"
fi

echo ""

# Get service account from argument or construct default
if [ -z "$2" ]; then
  SERVICE_ACCOUNT="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"
  echo "Using default service account: $SERVICE_ACCOUNT"
else
  SERVICE_ACCOUNT="$2"
  echo "Using provided service account: $SERVICE_ACCOUNT"
fi

echo ""
echo "-------------------------------------------------------------------"
echo "This script will grant the following permissions:"
echo "  - Service Account: $SERVICE_ACCOUNT"
echo "  - Role: roles/secretmanager.secretAccessor"
echo "  - Secrets: DATABASE_URL, SECRET_KEY, MAILERSEND_API_KEY, BACKEND_CORS_ORIGINS"
echo "-------------------------------------------------------------------"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

echo ""
echo "Granting secret access permissions..."
echo ""

# List of secrets that need access
SECRETS=(
  "DATABASE_URL"
  "SECRET_KEY"
  "MAILERSEND_API_KEY"
  "BACKEND_CORS_ORIGINS"
)

# Counter for successful grants
SUCCESS_COUNT=0
FAILED_COUNT=0

# Grant access to each secret
for SECRET in "${SECRETS[@]}"; do
  echo "Processing secret: $SECRET"

  # Check if secret exists
  if gcloud secrets describe "$SECRET" --project="$PROJECT_ID" &>/dev/null; then
    # Grant access
    if gcloud secrets add-iam-policy-binding "$SECRET" \
      --member="serviceAccount:$SERVICE_ACCOUNT" \
      --role="roles/secretmanager.secretAccessor" \
      --project="$PROJECT_ID" &>/dev/null; then
      echo "  ✓ Granted access to $SECRET"
      ((SUCCESS_COUNT++))
    else
      echo "  ✗ Failed to grant access to $SECRET"
      ((FAILED_COUNT++))
    fi
  else
    echo "  ⚠ Secret $SECRET does not exist - skipping"
    ((FAILED_COUNT++))
  fi
done

echo ""
echo "==================================================================="
echo "Summary:"
echo "  ✓ Successfully granted: $SUCCESS_COUNT"
if [ $FAILED_COUNT -gt 0 ]; then
  echo "  ✗ Failed/Skipped: $FAILED_COUNT"
fi
echo "==================================================================="
echo ""

if [ $SUCCESS_COUNT -eq ${#SECRETS[@]} ]; then
  echo "✓ All secrets configured successfully!"
  echo ""
  echo "Next steps:"
  echo "  1. Verify the permissions:"
  echo "     gcloud secrets get-iam-policy DATABASE_URL --project=$PROJECT_ID"
  echo ""
  echo "  2. Re-run your deployment:"
  echo "     git push origin main"
  echo ""
else
  echo "⚠ Some secrets were not configured."
  echo ""
  echo "You may need to:"
  echo "  1. Create missing secrets using setup-gcp-secrets.sh"
  echo "  2. Check that the service account exists"
  echo "  3. Verify you have permission to modify secret IAM policies"
  echo ""
fi

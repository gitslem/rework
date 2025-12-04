#!/bin/bash
set -e

# Grant all necessary permissions to the GitHub Actions service account
# for Cloud Run deployment, Artifact Registry, and Secret Manager

PROJECT_ID="remote-worksio"
SERVICE_ACCOUNT="github-actions@remote-worksio.iam.gserviceaccount.com"

echo "=================================================================="
echo "Grant GitHub Actions Service Account Permissions"
echo "=================================================================="
echo ""
echo "Project: $PROJECT_ID"
echo "Service Account: $SERVICE_ACCOUNT"
echo ""
echo "This script will grant the following roles:"
echo "  - roles/artifactregistry.writer (push Docker images)"
echo "  - roles/run.admin (deploy Cloud Run services)"
echo "  - roles/iam.serviceAccountUser (deploy with service account)"
echo "  - roles/secretmanager.secretAccessor (access secrets)"
echo ""

# Array of roles to grant at project level
ROLES=(
  "roles/artifactregistry.writer"
  "roles/run.admin"
  "roles/iam.serviceAccountUser"
)

echo "Step 1: Granting project-level roles..."
echo ""

for ROLE in "${ROLES[@]}"; do
  echo "Granting $ROLE..."
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="$ROLE" \
    --condition=None \
    > /dev/null
  echo "✓ Granted $ROLE"
done

echo ""
echo "Step 2: Granting Secret Manager access to specific secrets..."
echo ""

# List of secrets that need access
SECRETS=(
  "DATABASE_URL"
  "SECRET_KEY"
  "MAILERSEND_API_KEY"
  "BACKEND_CORS_ORIGINS"
)

SUCCESS_COUNT=0
FAILED_COUNT=0

for SECRET in "${SECRETS[@]}"; do
  echo "Processing secret: $SECRET"

  if gcloud secrets describe "$SECRET" --project="$PROJECT_ID" &>/dev/null; then
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
echo "=================================================================="
echo "✓ Permission setup complete!"
echo ""
echo "Summary:"
echo "  ✓ Project-level roles: ${#ROLES[@]}"
echo "  ✓ Secret access granted: $SUCCESS_COUNT"
if [ $FAILED_COUNT -gt 0 ]; then
  echo "  ⚠ Secrets skipped: $FAILED_COUNT"
fi
echo ""
echo "IMPORTANT: Wait 5 minutes for IAM changes to propagate"
echo "Then retry your GitHub Actions deployment"
echo "=================================================================="

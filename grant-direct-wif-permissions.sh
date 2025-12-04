#!/bin/bash
set -e

# Grant permissions directly to Workload Identity Pool principal
# This uses Direct WIF instead of service account impersonation

PROJECT_ID="remote-worksio"
PROJECT_NUMBER="706683337174"
POOL_NAME="github-pool"
REPO="gitslem/rework"

# Construct the principal for the Workload Identity Pool
PRINCIPAL="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${REPO}"

echo "=================================================================="
echo "Grant Direct Workload Identity Federation Permissions"
echo "=================================================================="
echo ""
echo "Project: $PROJECT_ID"
echo "Project Number: $PROJECT_NUMBER"
echo "Pool: $POOL_NAME"
echo "Repository: $REPO"
echo ""
echo "Principal:"
echo "$PRINCIPAL"
echo ""
echo "This script will grant the following roles directly to the"
echo "Workload Identity Pool principal (no service account):"
echo "  - roles/artifactregistry.writer"
echo "  - roles/run.admin"
echo "  - roles/iam.serviceAccountUser"
echo ""

# Array of roles to grant at project level
ROLES=(
  "roles/artifactregistry.writer"
  "roles/run.admin"
  "roles/iam.serviceAccountUser"
)

echo "Step 1: Granting project-level roles to WIF principal..."
echo ""

for ROLE in "${ROLES[@]}"; do
  echo "Granting $ROLE..."
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="$PRINCIPAL" \
    --role="$ROLE" \
    --condition=None \
    > /dev/null
  echo "✓ Granted $ROLE"
done

echo ""
echo "Step 2: Granting permission to act as service account..."
echo ""

# Service account that Cloud Run will use
CLOUD_RUN_SERVICE_ACCOUNT="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Granting permission to act as service account: $CLOUD_RUN_SERVICE_ACCOUNT"
if gcloud iam service-accounts add-iam-policy-binding "$CLOUD_RUN_SERVICE_ACCOUNT" \
  --member="$PRINCIPAL" \
  --role="roles/iam.serviceAccountUser" \
  --project="$PROJECT_ID" > /dev/null 2>&1; then
  echo "✓ Granted permission to act as $CLOUD_RUN_SERVICE_ACCOUNT"
else
  echo "⚠ Warning: Could not grant service account user permission"
  echo "  The service account may not exist. You may need to create it first."
fi

echo ""
echo "Step 3: Granting Artifact Registry repository-level permissions..."
echo ""

# Grant repository-level permissions (CRITICAL for Direct WIF)
ARTIFACT_REPO="cloud-run-source-deploy"
ARTIFACT_LOCATION="us-central1"

echo "Granting roles/artifactregistry.writer to repository: $ARTIFACT_REPO"
if gcloud artifacts repositories add-iam-policy-binding "$ARTIFACT_REPO" \
  --location="$ARTIFACT_LOCATION" \
  --member="$PRINCIPAL" \
  --role="roles/artifactregistry.writer" \
  --project="$PROJECT_ID" > /dev/null 2>&1; then
  echo "✓ Granted repository-level access to $ARTIFACT_REPO"
else
  echo "⚠ Warning: Could not grant repository-level access (repository may not exist yet)"
  echo "  If repository doesn't exist, it will be created automatically on first push"
fi

echo ""
echo "Step 4: Granting Secret Manager access to specific secrets..."
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
    # Grant access to WIF principal
    if gcloud secrets add-iam-policy-binding "$SECRET" \
      --member="$PRINCIPAL" \
      --role="roles/secretmanager.secretAccessor" \
      --project="$PROJECT_ID" &>/dev/null; then
      echo "  ✓ Granted WIF principal access to $SECRET"
    fi

    # Grant access to Cloud Run service account
    if gcloud secrets add-iam-policy-binding "$SECRET" \
      --member="serviceAccount:$CLOUD_RUN_SERVICE_ACCOUNT" \
      --role="roles/secretmanager.secretAccessor" \
      --project="$PROJECT_ID" &>/dev/null; then
      echo "  ✓ Granted service account access to $SECRET"
      ((SUCCESS_COUNT++))
    else
      echo "  ✗ Failed to grant service account access to $SECRET"
      ((FAILED_COUNT++))
    fi
  else
    echo "  ⚠ Secret $SECRET does not exist - skipping"
    ((FAILED_COUNT++))
  fi
done

echo ""
echo "=================================================================="
echo "✓ Direct WIF permission setup complete!"
echo ""
echo "Summary:"
echo "  ✓ Project-level roles: ${#ROLES[@]}"
echo "  ✓ Service account user permission: granted"
echo "  ✓ Artifact Registry repository: configured"
echo "  ✓ Secret access granted: $SUCCESS_COUNT"
if [ $FAILED_COUNT -gt 0 ]; then
  echo "  ⚠ Secrets skipped: $FAILED_COUNT"
fi
echo ""
echo "IMPORTANT CHANGES:"
echo "  - Using Direct Workload Identity Federation"
echo "  - Permissions granted to WIF pool principal directly"
echo "  - Repository-level permissions added for Artifact Registry"
echo "  - No service account impersonation (this was causing errors)"
echo ""
echo "IMPORTANT: Wait 5 minutes for IAM changes to propagate"
echo "Then retry your GitHub Actions deployment"
echo "=================================================================="

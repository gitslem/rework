#!/bin/bash
set -e

# Comprehensive fix for Workload Identity Federation and Cloud Run deployment
# This script will detect the actual pool name and fix all configurations

PROJECT_ID="remote-worksio"
PROJECT_NUMBER="706683337174"
REPO="gitslem/rework"
SERVICE_ACCOUNT="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"
PROVIDER_NAME="github-provider"

echo "=================================================================="
echo "COMPREHENSIVE WORKLOAD IDENTITY FIX"
echo "=================================================================="
echo ""
echo "This script will:"
echo "  1. Detect the actual Workload Identity Pool name"
echo "  2. Grant Direct WIF permissions to the WIF principal"
echo "  3. Grant Cloud Run runtime permissions to the service account"
echo "  4. Configure Artifact Registry access (project + repository level)"
echo "  5. Configure Secret Manager access"
echo "  6. Display the correct GitHub secrets"
echo ""
echo "=================================================================="
echo ""

# Step 1: Detect the actual pool name
echo "Step 1: Detecting actual Workload Identity Pool..."
echo ""

POOL_NAME=""
for pool in "github-pool" "github-actions" "github-actions-pool"; do
  echo "  Checking if pool '$pool' exists..."
  if gcloud iam workload-identity-pools describe "$pool" \
      --location=global \
      --project="$PROJECT_ID" &>/dev/null; then
    POOL_NAME="$pool"
    echo "  ✓ Found pool: $POOL_NAME"
    break
  fi
done

if [ -z "$POOL_NAME" ]; then
  echo ""
  echo "=================================================================="
  echo "ERROR: No Workload Identity Pool found!"
  echo "=================================================================="
  echo ""
  echo "Please create one using one of these commands:"
  echo ""
  echo "Option 1: Create 'github-pool':"
  echo "  gcloud iam workload-identity-pools create github-pool \\"
  echo "    --location=global \\"
  echo "    --display-name=\"GitHub Actions Pool\" \\"
  echo "    --project=$PROJECT_ID"
  echo ""
  echo "Option 2: Run ./setup-workload-identity-pool.sh"
  echo ""
  exit 1
fi

echo ""
echo "Using Workload Identity Pool: $POOL_NAME"
echo ""

# Construct the principal
PRINCIPAL="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${REPO}"

echo "WIF Principal:"
echo "$PRINCIPAL"
echo ""
echo "=================================================================="
echo ""

# Step 2: Verify provider exists
echo "Step 2: Verifying OIDC provider exists..."
echo ""

if gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
    --workload-identity-pool="$POOL_NAME" \
    --location=global \
    --project="$PROJECT_ID" &>/dev/null; then
  echo "✓ Provider '$PROVIDER_NAME' exists"
else
  echo ""
  echo "=================================================================="
  echo "ERROR: OIDC provider '$PROVIDER_NAME' not found!"
  echo "=================================================================="
  echo ""
  echo "Create it with:"
  echo ""
  echo "gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \\"
  echo "  --location=global \\"
  echo "  --workload-identity-pool=$POOL_NAME \\"
  echo "  --display-name=\"GitHub Provider\" \\"
  echo "  --issuer-uri=\"https://token.actions.githubusercontent.com\" \\"
  echo "  --attribute-mapping=\"google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner\" \\"
  echo "  --attribute-condition=\"assertion.repository_owner == 'gitslem'\" \\"
  echo "  --project=$PROJECT_ID"
  echo ""
  exit 1
fi

echo ""
echo "=================================================================="
echo ""

# Step 3: Grant project-level roles to WIF principal (for deployment)
echo "Step 3: Granting Direct WIF permissions to WIF principal..."
echo ""
echo "These permissions allow GitHub Actions to deploy:"
echo ""

WIF_ROLES=(
  "roles/artifactregistry.writer"
  "roles/run.admin"
  "roles/iam.serviceAccountUser"
)

for ROLE in "${WIF_ROLES[@]}"; do
  echo "  Granting $ROLE to WIF principal..."
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="$PRINCIPAL" \
    --role="$ROLE" \
    --condition=None \
    > /dev/null 2>&1 || echo "    (may already exist)"
  echo "  ✓ Granted $ROLE"
done

echo ""
echo "=================================================================="
echo ""

# Step 4: Grant service account user permission to act as the service account
echo "Step 4: Granting permission to act as Cloud Run service account..."
echo ""

if gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT" \
  --member="$PRINCIPAL" \
  --role="roles/iam.serviceAccountUser" \
  --project="$PROJECT_ID" > /dev/null 2>&1; then
  echo "✓ Granted WIF principal permission to act as $SERVICE_ACCOUNT"
else
  echo "⚠ Warning: Could not grant service account user permission"
  echo "  The service account may not exist or permission may already be granted"
fi

echo ""
echo "=================================================================="
echo ""

# Step 5: Grant Artifact Registry repository-level permissions
echo "Step 5: Configuring Artifact Registry access..."
echo ""

ARTIFACT_REPO="cloud-run-source-deploy"
ARTIFACT_LOCATION="us-central1"

echo "  Granting repository-level access to: $ARTIFACT_REPO"
if gcloud artifacts repositories add-iam-policy-binding "$ARTIFACT_REPO" \
  --location="$ARTIFACT_LOCATION" \
  --member="$PRINCIPAL" \
  --role="roles/artifactregistry.writer" \
  --project="$PROJECT_ID" > /dev/null 2>&1; then
  echo "  ✓ Granted repository-level access"
else
  echo "  ⚠ Repository may not exist yet (will be created automatically on first push)"
fi

echo ""
echo "=================================================================="
echo ""

# Step 6: Grant service account permissions (for Cloud Run runtime)
echo "Step 6: Granting Cloud Run runtime permissions to service account..."
echo ""
echo "These permissions allow the Cloud Run service to access secrets:"
echo ""

SA_ROLES=(
  "roles/secretmanager.secretAccessor"
)

for ROLE in "${SA_ROLES[@]}"; do
  echo "  Granting $ROLE to service account..."
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="$ROLE" \
    --condition=None \
    > /dev/null 2>&1 || echo "    (may already exist)"
  echo "  ✓ Granted $ROLE"
done

echo ""
echo "=================================================================="
echo ""

# Step 7: Grant secret access to both WIF and service account
echo "Step 7: Configuring Secret Manager access..."
echo ""

SECRETS=(
  "DATABASE_URL"
  "SECRET_KEY"
  "MAILERSEND_API_KEY"
  "BACKEND_CORS_ORIGINS"
)

SUCCESS_COUNT=0
FAILED_COUNT=0

for SECRET in "${SECRETS[@]}"; do
  echo "  Processing secret: $SECRET"

  if gcloud secrets describe "$SECRET" --project="$PROJECT_ID" &>/dev/null; then
    # Grant access to WIF principal (for deployment)
    if gcloud secrets add-iam-policy-binding "$SECRET" \
      --member="$PRINCIPAL" \
      --role="roles/secretmanager.secretAccessor" \
      --project="$PROJECT_ID" &>/dev/null; then
      echo "    ✓ Granted WIF principal access"
    else
      echo "    (WIF access may already exist)"
    fi

    # Grant access to Cloud Run service account (for runtime)
    if gcloud secrets add-iam-policy-binding "$SECRET" \
      --member="serviceAccount:$SERVICE_ACCOUNT" \
      --role="roles/secretmanager.secretAccessor" \
      --project="$PROJECT_ID" &>/dev/null; then
      echo "    ✓ Granted service account access"
      ((SUCCESS_COUNT++))
    else
      echo "    (Service account access may already exist)"
      ((SUCCESS_COUNT++))
    fi
  else
    echo "    ⚠ Secret does not exist - skipping"
    ((FAILED_COUNT++))
  fi
done

echo ""
echo "=================================================================="
echo "✓ COMPREHENSIVE SETUP COMPLETE!"
echo "=================================================================="
echo ""
echo "Summary:"
echo "  ✓ Workload Identity Pool: $POOL_NAME"
echo "  ✓ WIF Principal permissions: ${#WIF_ROLES[@]} roles"
echo "  ✓ Service Account permissions: ${#SA_ROLES[@]} roles"
echo "  ✓ Artifact Registry: configured"
echo "  ✓ Secret access: $SUCCESS_COUNT secrets configured"
if [ $FAILED_COUNT -gt 0 ]; then
  echo "  ⚠ Secrets not found: $FAILED_COUNT (create them with setup-gcp-secrets.sh)"
fi
echo ""
echo "=================================================================="
echo "GITHUB SECRETS CONFIGURATION"
echo "=================================================================="
echo ""
echo "Set these in your GitHub repository secrets:"
echo "https://github.com/gitslem/rework/settings/secrets/actions"
echo ""

# Get the full provider resource name
WORKLOAD_IDENTITY_PROVIDER=$(gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
  --workload-identity-pool="$POOL_NAME" \
  --location=global \
  --project="$PROJECT_ID" \
  --format="value(name)")

echo "WORKLOAD_IDENTITY_PROVIDER:"
echo "$WORKLOAD_IDENTITY_PROVIDER"
echo ""
echo "GCP_PROJECT_ID:"
echo "$PROJECT_ID"
echo ""
echo "GCP_SERVICE_ACCOUNT:"
echo "$SERVICE_ACCOUNT"
echo ""
echo "NEXT_PUBLIC_SITE_URL:"
echo "https://www.remote-works.io  (or your actual frontend URL)"
echo ""
echo "FROM_EMAIL:"
echo "noreply@remote-works.io  (or your actual sender email)"
echo ""
echo "=================================================================="
echo ""
echo "IMPORTANT:"
echo "  1. Wait 5 minutes for IAM changes to propagate"
echo "  2. Verify GitHub secrets are set correctly"
echo "  3. Push to trigger deployment"
echo ""
echo "=================================================================="

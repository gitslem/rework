#!/bin/bash
set -e

# Fix Workload Identity Federation for GitHub Actions
# Based on official Google Cloud troubleshooting guides
# Auto-detects the actual pool name

PROJECT_ID="remote-worksio"
PROJECT_NUMBER="706683337174"
SERVICE_ACCOUNT="github-actions@remote-worksio.iam.gserviceaccount.com"
PROVIDER_NAME="github-provider"
REPO="gitslem/rework"

echo "=================================================================="
echo "Fixing Workload Identity Federation for GitHub Actions"
echo "=================================================================="
echo ""
echo "Project: $PROJECT_ID"
echo "Service Account: $SERVICE_ACCOUNT"
echo "Repository: $REPO"
echo ""

# Auto-detect the pool name
echo "Detecting Workload Identity Pool..."
POOL_NAME=""
for pool in "github-pool" "github-actions" "github-actions-pool"; do
  if gcloud iam workload-identity-pools describe "$pool" \
      --location=global \
      --project="$PROJECT_ID" &>/dev/null; then
    POOL_NAME="$pool"
    echo "✓ Found pool: $POOL_NAME"
    break
  fi
done

if [ -z "$POOL_NAME" ]; then
  echo ""
  echo "=================================================================="
  echo "ERROR: No Workload Identity Pool found!"
  echo "=================================================================="
  echo ""
  echo "Please create one first using ./setup-workload-identity-pool.sh"
  echo ""
  exit 1
fi

echo ""
echo "Pool: $POOL_NAME"
echo ""

# Step 1: Enable IAM Service Account Credentials API
echo "Step 1: Enabling IAM Service Account Credentials API..."
gcloud services enable iamcredentials.googleapis.com --project="$PROJECT_ID"
echo "✓ API enabled"
echo ""

# Step 2: Grant workloadIdentityUser role
echo "Step 2: Granting workloadIdentityUser role..."
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/attribute.repository/$REPO"
echo "✓ workloadIdentityUser granted"
echo ""

# Step 3: Grant serviceAccountTokenCreator role (required for token generation)
echo "Step 3: Granting serviceAccountTokenCreator role..."
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT" \
  --project="$PROJECT_ID" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/attribute.repository/$REPO"
echo "✓ serviceAccountTokenCreator granted"
echo ""

# Step 4: Verify the configuration
echo "Step 4: Verifying configuration..."
echo ""
echo "Service Account IAM Policy:"
gcloud iam service-accounts get-iam-policy "$SERVICE_ACCOUNT" --project="$PROJECT_ID"
echo ""

# Step 5: Display the correct GitHub secrets
echo "=================================================================="
echo "GitHub Secrets Configuration"
echo "=================================================================="
echo ""
echo "Set these in your GitHub repository secrets:"
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
echo "GCP_SERVICE_ACCOUNT:"
echo "$SERVICE_ACCOUNT"
echo ""
echo "GCP_PROJECT_ID:"
echo "$PROJECT_ID"
echo ""
echo "=================================================================="
echo "✓ Setup complete!"
echo ""
echo "IMPORTANT: Wait 5 minutes for IAM changes to propagate"
echo "Then retry your GitHub Actions deployment"
echo "=================================================================="

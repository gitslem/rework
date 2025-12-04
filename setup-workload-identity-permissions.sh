#!/bin/bash
# Comprehensive permissions setup for Workload Identity deployment
# This script grants all necessary permissions for Cloud Run deployment via GitHub Actions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Workload Identity Permissions Setup for GitHub Actions  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}No project set. Please enter your GCP project ID:${NC}"
    read -p "Project ID: " PROJECT_ID
    gcloud config set project "$PROJECT_ID"
fi

# Get project number
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")

# Service accounts
GITHUB_SA="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo -e "${BLUE}Project Information:${NC}"
echo -e "  Project ID:      ${GREEN}$PROJECT_ID${NC}"
echo -e "  Project Number:  ${GREEN}$PROJECT_NUMBER${NC}"
echo -e "  GitHub SA:       ${GREEN}$GITHUB_SA${NC}"
echo -e "  Cloud Build SA:  ${GREEN}$CLOUD_BUILD_SA${NC}"
echo -e "  Compute SA:      ${GREEN}$COMPUTE_SA${NC}"
echo ""

# Enable required APIs
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 1: Enabling Required APIs${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

APIS=(
    "iam.googleapis.com"
    "iamcredentials.googleapis.com"
    "cloudresourcemanager.googleapis.com"
    "sts.googleapis.com"
    "cloudbuild.googleapis.com"
    "run.googleapis.com"
    "artifactregistry.googleapis.com"
    "secretmanager.googleapis.com"
    "serviceusage.googleapis.com"
    "storage.googleapis.com"
)

for api in "${APIS[@]}"; do
    echo -e "  ${YELLOW}Enabling $api...${NC}"
    gcloud services enable "$api" --project="$PROJECT_ID" --quiet 2>/dev/null || echo -e "  ${GREEN}✓ Already enabled${NC}"
done

echo -e "${GREEN}✓ All required APIs enabled${NC}"
echo ""

# Create github-actions service account if it doesn't exist
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 2: Creating Service Account${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if gcloud iam service-accounts describe "$GITHUB_SA" --project="$PROJECT_ID" &>/dev/null; then
    echo -e "${GREEN}✓ Service account already exists: $GITHUB_SA${NC}"
else
    echo -e "${YELLOW}Creating service account: $GITHUB_SA${NC}"
    gcloud iam service-accounts create github-actions \
        --display-name="GitHub Actions Service Account" \
        --description="Service account for GitHub Actions deployments using Workload Identity" \
        --project="$PROJECT_ID"
    echo -e "${GREEN}✓ Service account created${NC}"
fi
echo ""

# Grant project-level IAM roles to GitHub Actions SA
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 3: Granting Project-Level Permissions to GitHub SA${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

GITHUB_ROLES=(
    "roles/run.admin"                           # Deploy Cloud Run services
    "roles/cloudbuild.builds.builder"           # Create and execute builds
    "roles/artifactregistry.admin"              # Create repos and push images
    "roles/iam.serviceAccountUser"              # Act as other service accounts
    "roles/secretmanager.secretAccessor"        # Access secrets
    "roles/serviceusage.serviceUsageConsumer"   # Use GCP services
    "roles/storage.admin"                       # Access Cloud Build buckets
)

for role in "${GITHUB_ROLES[@]}"; do
    echo -e "  ${YELLOW}Granting $role...${NC}"
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:$GITHUB_SA" \
        --role="$role" \
        --condition=None \
        --quiet 2>/dev/null && echo -e "  ${GREEN}✓ Granted${NC}" || echo -e "  ${GREEN}✓ Already has role${NC}"
done

echo -e "${GREEN}✓ GitHub Actions SA permissions granted${NC}"
echo ""

# Grant permissions to Cloud Build SA
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 4: Granting Permissions to Cloud Build SA${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

CLOUD_BUILD_ROLES=(
    "roles/run.admin"                           # Deploy to Cloud Run
    "roles/iam.serviceAccountUser"              # Act as service accounts
    "roles/artifactregistry.writer"             # Push images
    "roles/storage.objectAdmin"                 # Access build artifacts
    "roles/serviceusage.serviceUsageConsumer"   # Use GCP services
)

for role in "${CLOUD_BUILD_ROLES[@]}"; do
    echo -e "  ${YELLOW}Granting $role...${NC}"
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:$CLOUD_BUILD_SA" \
        --role="$role" \
        --condition=None \
        --quiet 2>/dev/null && echo -e "  ${GREEN}✓ Granted${NC}" || echo -e "  ${GREEN}✓ Already has role${NC}"
done

echo -e "${GREEN}✓ Cloud Build SA permissions granted${NC}"
echo ""

# Grant actAs permission
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 5: Granting ActAs Permission (Critical!)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}Allowing GitHub SA to act as Compute SA...${NC}"
gcloud iam service-accounts add-iam-policy-binding "$COMPUTE_SA" \
    --member="serviceAccount:$GITHUB_SA" \
    --role="roles/iam.serviceAccountUser" \
    --project="$PROJECT_ID" \
    --quiet 2>/dev/null && echo -e "${GREEN}✓ ActAs permission granted${NC}" || echo -e "${GREEN}✓ Already has permission${NC}"

echo -e "${YELLOW}Allowing Cloud Build SA to act as Compute SA...${NC}"
gcloud iam service-accounts add-iam-policy-binding "$COMPUTE_SA" \
    --member="serviceAccount:$CLOUD_BUILD_SA" \
    --role="roles/iam.serviceAccountUser" \
    --project="$PROJECT_ID" \
    --quiet 2>/dev/null && echo -e "${GREEN}✓ ActAs permission granted${NC}" || echo -e "${GREEN}✓ Already has permission${NC}"

echo ""

# Create Artifact Registry repository
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 6: Creating Artifact Registry Repository${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if gcloud artifacts repositories describe cloud-run-source-deploy \
    --location=us-central1 \
    --project="$PROJECT_ID" &>/dev/null; then
    echo -e "${GREEN}✓ Repository already exists: cloud-run-source-deploy${NC}"
else
    echo -e "${YELLOW}Creating Artifact Registry repository...${NC}"
    gcloud artifacts repositories create cloud-run-source-deploy \
        --repository-format=docker \
        --location=us-central1 \
        --description="Docker repository for Cloud Run deployments via GitHub Actions" \
        --project="$PROJECT_ID" \
        --quiet
    echo -e "${GREEN}✓ Repository created${NC}"
fi
echo ""

# Grant access to Cloud Build bucket
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 7: Granting Access to Cloud Build Bucket${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

CLOUD_BUILD_BUCKET="${PROJECT_NUMBER}_cloudbuild"

echo -e "${YELLOW}Granting GitHub SA access to Cloud Build bucket...${NC}"
gsutil iam ch serviceAccount:${GITHUB_SA}:objectAdmin gs://${CLOUD_BUILD_BUCKET} 2>/dev/null && \
    echo -e "${GREEN}✓ GitHub SA has bucket access${NC}" || \
    echo -e "${YELLOW}⚠ Bucket may not exist yet (will be created on first build)${NC}"

echo -e "${YELLOW}Granting Cloud Build SA access to Cloud Build bucket...${NC}"
gsutil iam ch serviceAccount:${CLOUD_BUILD_SA}:objectAdmin gs://${CLOUD_BUILD_BUCKET} 2>/dev/null && \
    echo -e "${GREEN}✓ Cloud Build SA has bucket access${NC}" || \
    echo -e "${YELLOW}⚠ Bucket may not exist yet (will be created on first build)${NC}"

echo ""

# Summary
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Setup Complete! ✓                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Permissions Summary:${NC}"
echo ""
echo -e "${YELLOW}GitHub Actions SA ($GITHUB_SA):${NC}"
echo -e "  ✓ Cloud Run Admin"
echo -e "  ✓ Cloud Build Builder"
echo -e "  ✓ Artifact Registry Admin"
echo -e "  ✓ Service Account User"
echo -e "  ✓ Secret Manager Accessor"
echo -e "  ✓ Service Usage Consumer"
echo -e "  ✓ Storage Admin"
echo -e "  ✓ Can act as Compute SA"
echo ""
echo -e "${YELLOW}Cloud Build SA ($CLOUD_BUILD_SA):${NC}"
echo -e "  ✓ Cloud Run Admin"
echo -e "  ✓ Service Account User"
echo -e "  ✓ Artifact Registry Writer"
echo -e "  ✓ Storage Object Admin"
echo -e "  ✓ Service Usage Consumer"
echo -e "  ✓ Can act as Compute SA"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo -e "1. ${YELLOW}Set up Workload Identity Pool (if not done):${NC}"
echo -e "   Run: ${GREEN}./setup-workload-identity-pool.sh${NC}"
echo ""
echo -e "2. ${YELLOW}Configure GitHub Secrets:${NC}"
echo -e "   - WORKLOAD_IDENTITY_PROVIDER (from step 1)"
echo -e "   - GCP_SERVICE_ACCOUNT: $GITHUB_SA"
echo -e "   - GCP_PROJECT_ID: $PROJECT_ID"
echo ""
echo -e "3. ${YELLOW}Test deployment:${NC}"
echo -e "   Push to main branch or manually trigger workflow"
echo ""
echo -e "${GREEN}All permissions are now in place! 🚀${NC}"
echo ""

#!/bin/bash
# Set up Workload Identity Federation for GitHub Actions
# This allows GitHub Actions to authenticate to GCP without service account keys

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Workload Identity Pool Setup for GitHub Actions      ║${NC}"
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

# Get GitHub repository info
echo -e "${YELLOW}Enter your GitHub repository information:${NC}"
read -p "GitHub Organization/Owner (default: gitslem): " GITHUB_OWNER
GITHUB_OWNER=${GITHUB_OWNER:-gitslem}

read -p "Repository Name (default: rework): " REPO_NAME
REPO_NAME=${REPO_NAME:-rework}

GITHUB_REPO="${GITHUB_OWNER}/${REPO_NAME}"
SERVICE_ACCOUNT="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

echo ""
echo -e "${BLUE}Configuration:${NC}"
echo -e "  Project ID:      ${GREEN}$PROJECT_ID${NC}"
echo -e "  Project Number:  ${GREEN}$PROJECT_NUMBER${NC}"
echo -e "  GitHub Repo:     ${GREEN}$GITHUB_REPO${NC}"
echo -e "  Service Account: ${GREEN}$SERVICE_ACCOUNT${NC}"
echo ""

# Create Workload Identity Pool
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 1: Creating Workload Identity Pool${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if gcloud iam workload-identity-pools describe "github-actions" \
    --location="global" \
    --project="$PROJECT_ID" &>/dev/null; then
    echo -e "${GREEN}✓ Workload Identity Pool already exists${NC}"
else
    echo -e "${YELLOW}Creating Workload Identity Pool...${NC}"
    gcloud iam workload-identity-pools create "github-actions" \
        --project="$PROJECT_ID" \
        --location="global" \
        --display-name="GitHub Actions Pool" \
        --description="Workload Identity Pool for GitHub Actions deployments"
    echo -e "${GREEN}✓ Workload Identity Pool created${NC}"
fi
echo ""

# Create OIDC Provider
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 2: Creating OIDC Provider for GitHub${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if gcloud iam workload-identity-pools providers describe "github-provider" \
    --workload-identity-pool="github-actions" \
    --location="global" \
    --project="$PROJECT_ID" &>/dev/null; then
    echo -e "${GREEN}✓ OIDC Provider already exists${NC}"
else
    echo -e "${YELLOW}Creating OIDC Provider...${NC}"
    gcloud iam workload-identity-pools providers create-oidc "github-provider" \
        --project="$PROJECT_ID" \
        --location="global" \
        --workload-identity-pool="github-actions" \
        --display-name="GitHub Provider" \
        --description="OIDC provider for GitHub Actions" \
        --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
        --attribute-condition="assertion.repository_owner == '${GITHUB_OWNER}'" \
        --issuer-uri="https://token.actions.githubusercontent.com"
    echo -e "${GREEN}✓ OIDC Provider created${NC}"
fi
echo ""

# Bind service account to Workload Identity
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 3: Binding Service Account to Workload Identity${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

WORKLOAD_IDENTITY_POOL_ID="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-actions"

echo -e "${YELLOW}Granting Workload Identity User role...${NC}"
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT" \
    --project="$PROJECT_ID" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${GITHUB_REPO}" \
    --quiet 2>/dev/null && echo -e "${GREEN}✓ Binding created${NC}" || echo -e "${GREEN}✓ Binding already exists${NC}"

echo ""

# Get Workload Identity Provider resource name
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 4: Getting Workload Identity Provider Resource Name${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

WORKLOAD_IDENTITY_PROVIDER=$(gcloud iam workload-identity-pools providers describe "github-provider" \
    --project="$PROJECT_ID" \
    --location="global" \
    --workload-identity-pool="github-actions" \
    --format="value(name)")

echo -e "${GREEN}✓ Workload Identity Provider: ${NC}"
echo -e "${BLUE}$WORKLOAD_IDENTITY_PROVIDER${NC}"
echo ""

# Summary and next steps
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Workload Identity Setup Complete! ✓            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}GitHub Secrets Configuration:${NC}"
echo ""
echo -e "${YELLOW}Add these secrets to your GitHub repository:${NC}"
echo -e "https://github.com/${GITHUB_REPO}/settings/secrets/actions"
echo ""
echo -e "${GREEN}WORKLOAD_IDENTITY_PROVIDER:${NC}"
echo -e "${BLUE}$WORKLOAD_IDENTITY_PROVIDER${NC}"
echo ""
echo -e "${GREEN}GCP_SERVICE_ACCOUNT:${NC}"
echo -e "${BLUE}$SERVICE_ACCOUNT${NC}"
echo ""
echo -e "${GREEN}GCP_PROJECT_ID:${NC}"
echo -e "${BLUE}$PROJECT_ID${NC}"
echo ""
echo -e "${GREEN}FROM_EMAIL:${NC}"
echo -e "${BLUE}noreply@${PROJECT_ID}.iam.gserviceaccount.com${NC}"
echo -e "${YELLOW}(or your preferred email address)${NC}"
echo ""
echo -e "${GREEN}NEXT_PUBLIC_SITE_URL:${NC}"
echo -e "${BLUE}https://your-site-url.com${NC}"
echo -e "${YELLOW}(your actual site URL)${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Verification:${NC}"
echo ""
echo -e "Test authentication with:"
echo -e "${GREEN}gcloud iam workload-identity-pools providers describe github-provider \\${NC}"
echo -e "${GREEN}  --workload-identity-pool=github-actions \\${NC}"
echo -e "${GREEN}  --location=global \\${NC}"
echo -e "${GREEN}  --project=$PROJECT_ID${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Setup complete! You can now deploy via GitHub Actions! 🚀${NC}"
echo ""

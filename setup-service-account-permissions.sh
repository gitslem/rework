#!/bin/bash
# Complete Service Account Permissions Setup for Cloud Run Deployment
# This script configures all required permissions for GitHub Actions deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Cloud Run Service Account Permissions Setup ===${NC}"
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

echo -e "${GREEN}Project ID: $PROJECT_ID${NC}"
echo -e "${GREEN}Project Number: $PROJECT_NUMBER${NC}"
echo ""

# Get service account
echo -e "${YELLOW}Enter the GitHub Actions service account email:${NC}"
echo "Example: github-actions@${PROJECT_ID}.iam.gserviceaccount.com"
read -p "Service account email: " SERVICE_ACCOUNT

if [ -z "$SERVICE_ACCOUNT" ]; then
    echo -e "${RED}Error: Service account email is required${NC}"
    exit 1
fi

# Compute service account (Cloud Run runtime)
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo -e "${GREEN}GitHub Actions SA: $SERVICE_ACCOUNT${NC}"
echo -e "${GREEN}Cloud Run Runtime SA: $COMPUTE_SA${NC}"
echo ""

# 1. Grant project-level IAM roles
echo -e "${YELLOW}Step 1: Granting project-level IAM roles...${NC}"

ROLES=(
    "roles/run.admin"
    "roles/cloudbuild.builds.editor"
    "roles/artifactregistry.writer"
    "roles/artifactregistry.admin"
    "roles/iam.serviceAccountUser"
    "roles/secretmanager.secretAccessor"
)

for role in "${ROLES[@]}"; do
    echo -e "${YELLOW}  Granting $role...${NC}"
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="$role" \
        --condition=None \
        --quiet 2>/dev/null || echo -e "${YELLOW}  (already has this role)${NC}"
done

echo -e "${GREEN}✓ Project-level roles granted${NC}"
echo ""

# 2. Grant actAs permission on compute service account
echo -e "${YELLOW}Step 2: Granting actAs permission on Cloud Run runtime service account...${NC}"
gcloud iam service-accounts add-iam-policy-binding "$COMPUTE_SA" \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/iam.serviceAccountUser" \
    --project="$PROJECT_ID" \
    --quiet

echo -e "${GREEN}✓ ActAs permission granted${NC}"
echo ""

# 3. Create Artifact Registry repository
echo -e "${YELLOW}Step 3: Creating Artifact Registry repository...${NC}"

REGION="us-central1"
REPO_NAME="cloud-run-source-deploy"

if gcloud artifacts repositories describe "$REPO_NAME" \
    --location="$REGION" \
    --project="$PROJECT_ID" &>/dev/null; then
    echo -e "${YELLOW}Repository already exists${NC}"
else
    gcloud artifacts repositories create "$REPO_NAME" \
        --repository-format=docker \
        --location="$REGION" \
        --description="Docker repository for Cloud Run source deployments" \
        --project="$PROJECT_ID"
    echo -e "${GREEN}✓ Repository created${NC}"
fi

echo ""

# 4. Enable required APIs
echo -e "${YELLOW}Step 4: Enabling required APIs...${NC}"

APIS=(
    "run.googleapis.com"
    "cloudbuild.googleapis.com"
    "artifactregistry.googleapis.com"
    "secretmanager.googleapis.com"
    "iam.googleapis.com"
)

for api in "${APIS[@]}"; do
    echo -e "${YELLOW}  Enabling $api...${NC}"
    gcloud services enable "$api" --project="$PROJECT_ID" --quiet
done

echo -e "${GREEN}✓ APIs enabled${NC}"
echo ""

# 5. Grant secret access
echo -e "${YELLOW}Step 5: Granting access to secrets (if they exist)...${NC}"

SECRETS=("DATABASE_URL" "SECRET_KEY" "MAILERSEND_API_KEY" "BACKEND_CORS_ORIGINS")

for secret in "${SECRETS[@]}"; do
    if gcloud secrets describe "$secret" --project="$PROJECT_ID" &>/dev/null; then
        echo -e "${YELLOW}  Granting access to $secret...${NC}"
        gcloud secrets add-iam-policy-binding "$secret" \
            --member="serviceAccount:$SERVICE_ACCOUNT" \
            --role="roles/secretmanager.secretAccessor" \
            --project="$PROJECT_ID" \
            --quiet 2>/dev/null || echo -e "${YELLOW}  (already has access)${NC}"
    else
        echo -e "${YELLOW}  Secret $secret does not exist (run setup-gcp-secrets.sh)${NC}"
    fi
done

echo -e "${GREEN}✓ Secret access configured${NC}"
echo ""

# Verification
echo -e "${GREEN}=== Verification ===${NC}"
echo ""

echo -e "${YELLOW}Verifying project-level IAM bindings...${NC}"
gcloud projects get-iam-policy "$PROJECT_ID" \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:$SERVICE_ACCOUNT" \
    --format="table(bindings.role)" | head -20

echo ""
echo -e "${YELLOW}Verifying Artifact Registry repository...${NC}"
gcloud artifacts repositories describe "$REPO_NAME" \
    --location="$REGION" \
    --project="$PROJECT_ID" \
    --format="table(name,format,createTime)"

echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Ensure GitHub secrets are configured:"
echo "   - WORKLOAD_IDENTITY_PROVIDER"
echo "   - GCP_SERVICE_ACCOUNT (should be: $SERVICE_ACCOUNT)"
echo "   - GCP_PROJECT_ID (should be: $PROJECT_ID)"
echo "   - NEXT_PUBLIC_SITE_URL"
echo "   - FROM_EMAIL"
echo ""
echo "2. Create Google Cloud secrets (if not already done):"
echo "   ./setup-gcp-secrets.sh"
echo ""
echo "3. Push to main branch to trigger deployment"
echo ""
echo -e "${GREEN}Configuration Summary:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Project Number: $PROJECT_NUMBER"
echo "  GitHub Actions SA: $SERVICE_ACCOUNT"
echo "  Cloud Run Runtime SA: $COMPUTE_SA"
echo "  Artifact Registry: $REGION/$REPO_NAME"
echo ""

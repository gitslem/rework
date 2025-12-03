#!/bin/bash
# Google Cloud Secrets Setup for Cloud Run Deployment
# This script creates all required secrets in Google Secret Manager

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Google Cloud Secrets Setup ===${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}No project set. Please enter your GCP project ID:${NC}"
    read -p "Project ID: " PROJECT_ID
    gcloud config set project "$PROJECT_ID"
fi

echo -e "${GREEN}Using project: $PROJECT_ID${NC}"
echo ""

# Enable Secret Manager API
echo -e "${YELLOW}Enabling Secret Manager API...${NC}"
gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID"

# Function to create or update a secret
create_secret() {
    local secret_name=$1
    local secret_description=$2

    echo -e "${YELLOW}Setting up secret: $secret_name${NC}"
    echo "Description: $secret_description"
    read -sp "Enter value (input hidden): " secret_value
    echo ""

    if [ -z "$secret_value" ]; then
        echo -e "${RED}Skipping empty value${NC}"
        return
    fi

    # Check if secret exists
    if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" &>/dev/null; then
        echo -e "${YELLOW}Secret exists. Creating new version...${NC}"
        echo -n "$secret_value" | gcloud secrets versions add "$secret_name" \
            --data-file=- \
            --project="$PROJECT_ID"
    else
        echo -e "${YELLOW}Creating new secret...${NC}"
        echo -n "$secret_value" | gcloud secrets create "$secret_name" \
            --data-file=- \
            --replication-policy="automatic" \
            --project="$PROJECT_ID"
    fi

    echo -e "${GREEN}✓ Secret $secret_name configured${NC}"
    echo ""
}

# Create required secrets
echo -e "${GREEN}=== Creating Required Secrets ===${NC}"
echo ""

create_secret "DATABASE_URL" "Database connection string (e.g., postgresql://user:pass@host/db)"
create_secret "SECRET_KEY" "JWT secret key (generate with: openssl rand -hex 32)"
create_secret "MAILERSEND_API_KEY" "MailerSend API key for email notifications"
create_secret "BACKEND_CORS_ORIGINS" "CORS origins as JSON array (e.g., [\"https://example.com\"])"

# Grant Cloud Run service account access to secrets
echo -e "${GREEN}=== Granting Secret Access ===${NC}"
echo ""
echo -e "${YELLOW}Enter the service account email that Cloud Run will use:${NC}"
echo "Example: 123456789-compute@developer.gserviceaccount.com"
read -p "Service account email: " SERVICE_ACCOUNT

if [ -n "$SERVICE_ACCOUNT" ]; then
    echo -e "${YELLOW}Granting secret access to $SERVICE_ACCOUNT...${NC}"

    for secret in "DATABASE_URL" "SECRET_KEY" "MAILERSEND_API_KEY" "BACKEND_CORS_ORIGINS"; do
        gcloud secrets add-iam-policy-binding "$secret" \
            --member="serviceAccount:$SERVICE_ACCOUNT" \
            --role="roles/secretmanager.secretAccessor" \
            --project="$PROJECT_ID" 2>/dev/null || true
    done

    echo -e "${GREEN}✓ Secret access granted${NC}"
else
    echo -e "${YELLOW}Skipping service account access (you can do this later)${NC}"
fi

echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Ensure GitHub secrets are configured:"
echo "   - WORKLOAD_IDENTITY_PROVIDER"
echo "   - GCP_SERVICE_ACCOUNT"
echo "   - GCP_PROJECT_ID"
echo "   - NEXT_PUBLIC_SITE_URL"
echo "   - FROM_EMAIL"
echo ""
echo "2. Verify service account has these IAM roles:"
echo "   - Cloud Run Admin (roles/run.admin)"
echo "   - Cloud Build Editor (roles/cloudbuild.builds.editor)"
echo "   - Artifact Registry Writer (roles/artifactregistry.writer)"
echo "   - Service Account User (roles/iam.serviceAccountUser)"
echo "   - Secret Manager Secret Accessor (roles/secretmanager.secretAccessor)"
echo ""
echo "3. Push to main branch to trigger deployment"
echo ""
echo -e "${GREEN}For detailed instructions, see CLOUD_RUN_SETUP.md${NC}"

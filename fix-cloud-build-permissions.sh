#!/bin/bash
# Grant permissions to Cloud Build default service account
# This fixes the "Build failed because the default service account is missing required IAM permissions" error

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Cloud Build Service Account Permissions ===${NC}"
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

# Cloud Build service account
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

echo -e "${GREEN}Project ID: $PROJECT_ID${NC}"
echo -e "${GREEN}Project Number: $PROJECT_NUMBER${NC}"
echo -e "${GREEN}Cloud Build SA: $CLOUD_BUILD_SA${NC}"
echo ""

# Grant required roles to Cloud Build service account
echo -e "${YELLOW}Granting permissions to Cloud Build service account...${NC}"

ROLES=(
    "roles/iam.serviceAccountUser"
    "roles/artifactregistry.writer"
    "roles/storage.objectViewer"
    "roles/serviceusage.serviceUsageConsumer"
)

for role in "${ROLES[@]}"; do
    echo -e "${YELLOW}  Granting $role...${NC}"
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:$CLOUD_BUILD_SA" \
        --role="$role" \
        --condition=None \
        --quiet 2>/dev/null || echo -e "${YELLOW}  (already has this role)${NC}"
done

echo -e "${GREEN}✓ Cloud Build service account permissions granted${NC}"
echo ""

# Enable Cloud Build API (if not already enabled)
echo -e "${YELLOW}Ensuring Cloud Build API is enabled...${NC}"
gcloud services enable cloudbuild.googleapis.com --project="$PROJECT_ID"
echo -e "${GREEN}✓ Cloud Build API enabled${NC}"
echo ""

echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo "Cloud Build service account ($CLOUD_BUILD_SA) now has:"
echo "  - Service Account User (to act as other service accounts)"
echo "  - Artifact Registry Writer (to push Docker images)"
echo "  - Storage Object Viewer (to read source from GCS buckets)"
echo "  - Service Usage Consumer (to use GCP services)"
echo ""

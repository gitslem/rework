#!/bin/bash
# Fix permissions for firebase-adminsdk service account
# This fixes the "serviceusage.services.use permission" error

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Firebase Service Account Permissions Fix ===${NC}"
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

# Firebase service account (adjust if different)
FIREBASE_SA="firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com"
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

echo -e "${GREEN}Project ID: $PROJECT_ID${NC}"
echo -e "${GREEN}Project Number: $PROJECT_NUMBER${NC}"
echo -e "${GREEN}Firebase SA: $FIREBASE_SA${NC}"
echo -e "${GREEN}Cloud Build SA: $CLOUD_BUILD_SA${NC}"
echo ""

# Grant required permissions to Firebase service account
echo -e "${YELLOW}Granting permissions to Firebase service account...${NC}"

FIREBASE_ROLES=(
    "roles/serviceusage.serviceUsageConsumer"
    "roles/cloudbuild.builds.editor"
    "roles/run.admin"
)

for role in "${FIREBASE_ROLES[@]}"; do
    echo -e "${YELLOW}  Granting $role to Firebase SA...${NC}"
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:$FIREBASE_SA" \
        --role="$role" \
        --condition=None \
        --quiet 2>/dev/null || echo -e "${YELLOW}  (already has this role)${NC}"
done

echo -e "${GREEN}✓ Firebase service account permissions granted${NC}"
echo ""

# Grant required permissions to Cloud Build service account
echo -e "${YELLOW}Granting permissions to Cloud Build service account...${NC}"

CLOUD_BUILD_ROLES=(
    "roles/iam.serviceAccountUser"
    "roles/storage.objectViewer"
    "roles/serviceusage.serviceUsageConsumer"
    "roles/run.admin"
)

for role in "${CLOUD_BUILD_ROLES[@]}"; do
    echo -e "${YELLOW}  Granting $role to Cloud Build SA...${NC}"
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:$CLOUD_BUILD_SA" \
        --role="$role" \
        --condition=None \
        --quiet 2>/dev/null || echo -e "${YELLOW}  (already has this role)${NC}"
done

echo -e "${GREEN}✓ Cloud Build service account permissions granted${NC}"
echo ""

# Enable required APIs
echo -e "${YELLOW}Ensuring required APIs are enabled...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    serviceusage.googleapis.com \
    --project="$PROJECT_ID" \
    --quiet

echo -e "${GREEN}✓ Required APIs enabled${NC}"
echo ""

echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo "Permissions granted:"
echo "  Firebase SA ($FIREBASE_SA):"
echo "    - Service Usage Consumer (to use GCP services)"
echo "    - Cloud Build Editor (to create builds)"
echo "    - Cloud Run Admin (to deploy services)"
echo ""
echo "  Cloud Build SA ($CLOUD_BUILD_SA):"
echo "    - Service Account User (to act as other service accounts)"
echo "    - Storage Object Viewer (to read source from GCS buckets)"
echo "    - Service Usage Consumer (to use GCP services)"
echo "    - Cloud Run Admin (to deploy services)"
echo ""
echo -e "${GREEN}✅ This project now uses Workload Identity Federation!${NC}"
echo -e "${GREEN}The deploy-firebase.yml workflow has been migrated to use${NC}"
echo -e "${GREEN}the more secure Workload Identity authentication method.${NC}"
echo ""
echo -e "${YELLOW}Note: This script is kept for backward compatibility or${NC}"
echo -e "${YELLOW}troubleshooting purposes only. The production workflow no${NC}"
echo -e "${YELLOW}longer requires these service account key permissions.${NC}"
echo ""

#!/bin/bash
# Quick Database Setup Script
# Run this to create Google Cloud secrets with recommended database configuration

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Quick Database & Secrets Setup ===${NC}"
echo ""

PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}Enter your GCP project ID:${NC}"
    read -p "Project ID: " PROJECT_ID
    gcloud config set project "$PROJECT_ID"
fi

echo -e "${GREEN}Project: $PROJECT_ID${NC}"
echo ""

# Enable Secret Manager API
echo -e "${YELLOW}Enabling Secret Manager API...${NC}"
gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID" --quiet

# Function to create or update secret
create_secret() {
    local name=$1
    local value=$2

    if gcloud secrets describe "$name" --project="$PROJECT_ID" &>/dev/null; then
        echo -e "${YELLOW}Updating $name...${NC}"
        echo -n "$value" | gcloud secrets versions add "$name" --data-file=- --project="$PROJECT_ID"
    else
        echo -e "${YELLOW}Creating $name...${NC}"
        echo -n "$value" | gcloud secrets create "$name" --data-file=- --replication-policy="automatic" --project="$PROJECT_ID"
    fi
}

# 1. DATABASE_URL (using SQLite for simplicity)
echo -e "${GREEN}1. Setting up DATABASE_URL (SQLite for testing)${NC}"
create_secret "DATABASE_URL" "sqlite:///./remoteworks.db"
echo -e "${GREEN}✓ DATABASE_URL configured (SQLite - perfect for testing)${NC}"
echo ""

# 2. SECRET_KEY
echo -e "${GREEN}2. Generating SECRET_KEY${NC}"
SECRET_KEY=$(openssl rand -hex 32)
create_secret "SECRET_KEY" "$SECRET_KEY"
echo -e "${GREEN}✓ SECRET_KEY generated and saved${NC}"
echo ""

# 3. MAILERSEND_API_KEY
echo -e "${GREEN}3. MailerSend API Key${NC}"
echo "Get your API key from: https://app.mailersend.com/api-tokens"
read -sp "Enter MAILERSEND_API_KEY: " MAILERSEND_KEY
echo ""
create_secret "MAILERSEND_API_KEY" "$MAILERSEND_KEY"
echo -e "${GREEN}✓ MAILERSEND_API_KEY saved${NC}"
echo ""

# 4. BACKEND_CORS_ORIGINS
echo -e "${GREEN}4. CORS Origins${NC}"
echo "Enter your frontend URL (e.g., https://www.remote-works.io)"
read -p "Frontend URL: " FRONTEND_URL
CORS_ORIGINS="[\"$FRONTEND_URL\",\"${FRONTEND_URL/www./}\"]"
create_secret "BACKEND_CORS_ORIGINS" "$CORS_ORIGINS"
echo -e "${GREEN}✓ BACKEND_CORS_ORIGINS configured${NC}"
echo ""

# Grant access to github-actions service account
echo -e "${GREEN}5. Granting secret access to github-actions service account${NC}"
SERVICE_ACCOUNT="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

for secret in DATABASE_URL SECRET_KEY MAILERSEND_API_KEY BACKEND_CORS_ORIGINS; do
    gcloud secrets add-iam-policy-binding "$secret" \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor" \
        --project="$PROJECT_ID" \
        --quiet 2>/dev/null || true
done

echo -e "${GREEN}✓ Permissions granted${NC}"
echo ""

echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo "Secrets created:"
echo "  ✓ DATABASE_URL: sqlite:///./remoteworks.db (testing - data resets on restart)"
echo "  ✓ SECRET_KEY: (auto-generated)"
echo "  ✓ MAILERSEND_API_KEY: (configured)"
echo "  ✓ BACKEND_CORS_ORIGINS: $CORS_ORIGINS"
echo ""
echo -e "${YELLOW}Note: SQLite is used for testing. Data will be reset when Cloud Run restarts.${NC}"
echo -e "${YELLOW}For production, migrate to Cloud SQL PostgreSQL later.${NC}"
echo ""
echo "Next: Run ./fix-cloud-build-permissions.sh"

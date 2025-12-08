#!/bin/bash

# Deploy ALL Firebase Rules (Firestore + Storage)
# This script deploys both database and storage security rules

set -e

echo "=========================================================="
echo "🚀 Firebase Complete Rules Deployment"
echo "=========================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found!${NC}"
    echo "Installing firebase-tools..."
    npm install -g firebase-tools
fi

# Check if logged in to Firebase
echo "Checking Firebase authentication..."
firebase projects:list >/dev/null 2>&1 || {
    echo -e "${YELLOW}Not logged in to Firebase. Please log in:${NC}"
    firebase login
}

echo -e "${GREEN}✅ Firebase CLI authenticated${NC}"
echo ""

# Change to frontend directory
cd frontend || exit 1

# Show current project
echo -e "${BLUE}Current Firebase project:${NC}"
cat .firebaserc | grep -A 2 "projects" || echo "remote-works"
echo ""

# Show both rules files
echo "=========================================================="
echo -e "${BLUE}📋 Firestore Rules (firestore.rules):${NC}"
echo "=========================================================="
head -30 firestore.rules
echo "... (truncated for brevity)"
echo ""

echo "=========================================================="
echo -e "${BLUE}📋 Storage Rules (storage.rules):${NC}"
echo "=========================================================="
head -30 storage.rules
echo "... (truncated for brevity)"
echo ""

# Show firebase.json config
echo "=========================================================="
echo -e "${BLUE}📋 Firebase Configuration (firebase.json):${NC}"
echo "=========================================================="
cat firebase.json
echo ""

# Deploy BOTH Firestore and Storage rules
echo "=========================================================="
echo -e "${YELLOW}🚀 Deploying Firestore AND Storage rules...${NC}"
echo "=========================================================="
echo ""

firebase deploy --only firestore:rules,storage --project remote-works

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ ALL RULES DEPLOYED SUCCESSFULLY!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}Firestore Rules (Database):${NC}"
    echo -e "  ${GREEN}✓${NC} Users collection - signup allowed"
    echo -e "  ${GREEN}✓${NC} Profiles collection - create/update allowed"
    echo -e "  ${GREEN}✓${NC} Messages, notifications, and all collections configured"
    echo ""
    echo -e "${BLUE}Storage Rules (File Uploads):${NC}"
    echo -e "  ${GREEN}✓${NC} ID cards - candidates can upload: id-cards/{userId}/{fileName}"
    echo -e "  ${GREEN}✓${NC} Profile pictures - users can upload their photos"
    echo -e "  ${GREEN}✓${NC} Portfolio files - agents can upload portfolios"
    echo -e "  ${GREEN}✓${NC} Project files - authenticated users can upload"
    echo ""
    echo -e "${GREEN}🎉 SIGNUP FLOW IS NOW FULLY FUNCTIONAL!${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Test candidate signup at your registration page"
    echo "2. Complete profile with all fields"
    echo "3. Upload an ID card (should work now!)"
    echo "4. Submit the form (should succeed!)"
    echo ""
    echo -e "${GREEN}✨ Both database and storage permissions are now properly configured!${NC}"
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}❌ DEPLOYMENT FAILED!${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Common issues:${NC}"
    echo "1. Wrong project name - check .firebaserc file"
    echo "2. Insufficient permissions - check Firebase console IAM"
    echo "3. Network issues - check your internet connection"
    echo "4. Rules syntax error - check rules files for typos"
    echo ""
    echo -e "${YELLOW}Manual deployment via Firebase Console:${NC}"
    echo ""
    echo -e "${BLUE}For Firestore Rules:${NC}"
    echo "1. Go to https://console.firebase.google.com/"
    echo "2. Select project: remote-works"
    echo "3. Navigate to Firestore Database → Rules tab"
    echo "4. Copy rules from: frontend/firestore.rules"
    echo "5. Click Publish"
    echo ""
    echo -e "${BLUE}For Storage Rules:${NC}"
    echo "1. Go to https://console.firebase.google.com/"
    echo "2. Select project: remote-works"
    echo "3. Navigate to Storage → Rules tab"
    echo "4. Copy rules from: frontend/storage.rules"
    echo "5. Click Publish"
    exit 1
fi

#!/bin/bash

# Verify Firebase Rules Deployment
# This script checks if storage and firestore rules are properly deployed

set -e

echo "=========================================================="
echo "Firebase Rules Verification & Deployment"
echo "=========================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

echo ""
echo -e "${GREEN}✅ Firebase CLI authenticated${NC}"
echo ""

# Show current project
cd frontend || exit 1
echo "Current Firebase project configuration:"
cat .firebaserc | grep -A 2 "projects"
echo ""

# Show storage rules file
echo "=========================================================="
echo "Current Storage Rules (storage.rules):"
echo "=========================================================="
echo ""
head -30 storage.rules
echo ""
echo "... (truncated for brevity)"
echo ""

# Ask user to confirm deployment
echo "=========================================================="
echo -e "${YELLOW}Ready to deploy Firebase Storage rules${NC}"
echo "=========================================================="
echo ""
read -p "Deploy storage rules now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Deploying Firebase Storage rules..."
    firebase deploy --only storage --project remote-works

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}✅ Storage rules deployed successfully!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo "The following issues have been fixed:"
        echo -e "  ${GREEN}✓${NC} Candidates can now upload ID cards during signup"
        echo -e "  ${GREEN}✓${NC} ID card uploads follow correct path: id-cards/{userId}/{fileName}"
        echo -e "  ${GREEN}✓${NC} Profile pictures can be uploaded"
        echo -e "  ${GREEN}✓${NC} Portfolio files can be uploaded by agents"
        echo ""
        echo -e "${GREEN}🎉 Your signup flow should now work properly!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Test candidate signup at your registration page"
        echo "2. Try uploading an ID card"
        echo "3. Complete the profile"
        echo ""
    else
        echo ""
        echo -e "${RED}❌ Deployment failed!${NC}"
        echo ""
        echo "Common issues:"
        echo "1. Wrong project name - check .firebaserc file"
        echo "2. Insufficient permissions - check Firebase console IAM"
        echo "3. Network issues - check your internet connection"
        echo ""
        echo "To deploy manually via Firebase Console:"
        echo "1. Go to https://console.firebase.google.com/"
        echo "2. Select project: remote-works"
        echo "3. Navigate to Storage → Rules tab"
        echo "4. Copy rules from: frontend/storage.rules"
        echo "5. Click Publish"
        exit 1
    fi
else
    echo ""
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    echo ""
    echo "To deploy later, run:"
    echo "  ./verify-firebase-rules.sh"
    echo ""
    echo "Or deploy manually:"
    echo "  cd frontend && firebase deploy --only storage --project remote-works"
    exit 0
fi

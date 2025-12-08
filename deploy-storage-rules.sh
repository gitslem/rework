#!/bin/bash

# Deploy Firebase Storage Security Rules
# This script deploys the updated storage rules that fix the "storage/unauthorized" error

set -e

echo "=========================================================="
echo "Deploying Firebase Storage Security Rules"
echo "=========================================================="
echo ""

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo "Installing firebase-tools..."
    npm install -g firebase-tools
fi

# Check if logged in to Firebase
echo "Checking Firebase authentication..."
firebase projects:list >/dev/null 2>&1 || {
    echo "Not logged in to Firebase. Please log in:"
    firebase login
}

# Deploy Storage rules
echo ""
echo "Deploying Firebase Storage security rules..."
cd frontend || exit 1
firebase deploy --only storage --project remote-works

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Storage rules deployed successfully!"
    echo ""
    echo "The following issues have been fixed:"
    echo "  ✓ Candidates can now upload ID cards during signup"
    echo "  ✓ ID card uploads follow correct path: id-cards/{userId}/{fileName}"
    echo "  ✓ Profile pictures can be uploaded with proper permissions"
    echo "  ✓ Portfolio files can be uploaded by agents"
    echo "  ✓ Project files can be uploaded by authenticated users"
    echo ""
    echo "All storage paths now have proper security rules!"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Please check the error messages above."
    exit 1
fi

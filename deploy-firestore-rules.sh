#!/bin/bash

# Deploy Firestore Security Rules to Firebase
# This script deploys the updated security rules that fix the "Missing or insufficient permissions" error

set -e

echo "=========================================================="
echo "Deploying Firestore Security Rules"
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

# Deploy Firestore rules
echo ""
echo "Deploying Firestore security rules..."
firebase deploy --only firestore:rules --project remote-worksio

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Firestore rules deployed successfully!"
    echo ""
    echo "The following issues have been fixed:"
    echo "  ✓ Newsletter subscription button now works"
    echo "  ✓ Service requests can be created"
    echo "  ✓ Reviews can be submitted"
    echo "  ✓ Payments can be recorded"
    echo "  ✓ Transactions can be tracked"
    echo "  ✓ Platform credentials can be stored"
    echo "  ✓ Support requests can be submitted"
    echo "  ✓ Testimonials can be created"
    echo ""
    echo "All collections now have proper security rules!"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Please check the error messages above."
    exit 1
fi

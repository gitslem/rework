#!/bin/bash

# Custom Domain OAuth - Verification and Fix Script
# This script verifies and fixes common issues with custom domain OAuth

echo "=================================================="
echo "Custom Domain OAuth - Verification Script"
echo "Domain: www.remote-works.io"
echo "Project: remote-worksio"
echo "=================================================="
echo ""

# Step 1: Check Environment Configuration
echo "Step 1: Checking .env.local configuration..."
echo "--------------------------------------------"

if [ ! -f "/home/user/rework/frontend/.env.local" ]; then
    echo "❌ ERROR: .env.local file not found!"
    exit 1
fi

AUTH_DOMAIN=$(grep "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" /home/user/rework/frontend/.env.local | cut -d '=' -f2)
USE_REDIRECT=$(grep "NEXT_PUBLIC_USE_AUTH_REDIRECT" /home/user/rework/frontend/.env.local | cut -d '=' -f2)

echo "Auth Domain: $AUTH_DOMAIN"
echo "Use Redirect: $USE_REDIRECT"

if [ "$AUTH_DOMAIN" != "www.remote-works.io" ]; then
    echo "❌ ERROR: Auth domain is not set to www.remote-works.io"
    echo "Current value: $AUTH_DOMAIN"
    exit 1
fi

if [ "$USE_REDIRECT" != "true" ]; then
    echo "❌ ERROR: USE_AUTH_REDIRECT is not set to true"
    echo "Current value: $USE_REDIRECT"
    exit 1
fi

echo "✅ Environment configuration is correct"
echo ""

# Step 2: Clean and Rebuild
echo "Step 2: Cleaning and rebuilding application..."
echo "--------------------------------------------"

cd /home/user/rework/frontend

echo "Removing .next cache..."
rm -rf .next

echo "Removing node_modules/.cache..."
rm -rf node_modules/.cache

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""

# Step 3: Verify Build Output
echo "Step 3: Verifying build configuration..."
echo "--------------------------------------------"

# Check if the build picked up the environment variables
if grep -r "www.remote-works.io" .next/ >/dev/null 2>&1; then
    echo "✅ Custom domain found in build output"
else
    echo "⚠️  WARNING: Custom domain not found in build output"
    echo "This might indicate environment variables are not being picked up"
fi

echo ""

# Step 4: DNS Verification
echo "Step 4: Verifying DNS configuration..."
echo "--------------------------------------------"

echo "Checking www.remote-works.io DNS..."
nslookup www.remote-works.io 2>/dev/null || echo "⚠️  DNS lookup failed (this is normal if not using external DNS)"

echo ""

# Step 5: Configuration Checklist
echo "Step 5: Configuration Checklist"
echo "--------------------------------------------"
echo ""
echo "Please verify the following in Google Cloud Console:"
echo "URL: https://console.cloud.google.com/apis/credentials?project=remote-worksio"
echo ""
echo "✓ AUTHORIZED JAVASCRIPT ORIGINS must include:"
echo "  • https://www.remote-works.io"
echo "  • https://remote-works.io"
echo "  • https://remote-worksio.firebaseapp.com"
echo "  • https://remote-worksio.web.app"
echo "  • http://localhost:3000"
echo ""
echo "✓ AUTHORIZED REDIRECT URIs must include:"
echo "  • https://www.remote-works.io/__/auth/handler"
echo "  • https://remote-works.io/__/auth/handler"
echo "  • https://remote-worksio.firebaseapp.com/__/auth/handler"
echo "  • https://remote-worksio.web.app/__/auth/handler"
echo "  • http://localhost:3000/__/auth/handler"
echo ""
echo "Please verify the following in Firebase Console:"
echo "URL: https://console.firebase.google.com/project/remote-worksio/authentication/settings"
echo ""
echo "✓ AUTHORIZED DOMAINS must include:"
echo "  • www.remote-works.io"
echo "  • remote-works.io"
echo "  • localhost"
echo ""
echo "✓ HOSTING must show (already verified):"
echo "  • www.remote-works.io - Connected ✓"
echo "  • remote-works.io - Connected ✓"
echo ""

# Step 6: Start Development Server
echo "Step 6: Starting development server..."
echo "--------------------------------------------"
echo ""
echo "To test OAuth flow:"
echo "1. Open browser: http://localhost:3000/register"
echo "2. Open browser console (F12)"
echo "3. Click 'Continue with Google'"
echo "4. Check console for 'Auth Domain: www.remote-works.io'"
echo "5. Check if OAuth redirects use www.remote-works.io"
echo ""
echo "Starting server in 5 seconds..."
echo "Press Ctrl+C to cancel"
sleep 5

npm run dev

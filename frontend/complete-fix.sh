#!/bin/bash

# COMPLETE FIX: Custom Domain OAuth - Static Export Edition
# This script fixes the issue where Next.js static export doesn't pick up .env.local

set -e  # Exit on any error

echo "=========================================================="
echo "COMPLETE FIX: Custom Domain OAuth"
echo "Issue: Static export not using custom domain"
echo "=========================================================="
echo ""

cd /home/user/rework/frontend

# Step 1: Verify .env.local
echo "Step 1: Verifying .env.local configuration..."
echo "------------------------------------------------------------"

if [ ! -f ".env.local" ]; then
    echo "❌ ERROR: .env.local not found!"
    echo "Creating .env.local with correct values..."
    cat > .env.local << 'EOL'
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAhQqAlas0zbHcmTWLzceEdJ9gYPhxTl20
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.remote-works.io
NEXT_PUBLIC_FIREBASE_PROJECT_ID=remote-worksio
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=remote-worksio.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=706683337174
NEXT_PUBLIC_FIREBASE_APP_ID=1:706683337174:web:f66430adc232b56c794c77
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-44RTK1LJ30

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.remote-works.io

# Authentication Mode
NEXT_PUBLIC_USE_AUTH_REDIRECT=true
EOL
    echo "✅ Created .env.local"
fi

# Verify authDomain
AUTH_DOMAIN=$(grep "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" .env.local | cut -d '=' -f2)
echo "Auth Domain in .env.local: $AUTH_DOMAIN"

if [ "$AUTH_DOMAIN" != "www.remote-works.io" ]; then
    echo "❌ ERROR: Auth domain is NOT set to www.remote-works.io"
    echo "Current value: $AUTH_DOMAIN"
    echo "Fixing..."
    sed -i 's/NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=.*/NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.remote-works.io/' .env.local
    echo "✅ Fixed authDomain to www.remote-works.io"
fi

USE_REDIRECT=$(grep "NEXT_PUBLIC_USE_AUTH_REDIRECT" .env.local | cut -d '=' -f2)
echo "Use Redirect: $USE_REDIRECT"

if [ "$USE_REDIRECT" != "true" ]; then
    echo "⚠️  WARNING: USE_AUTH_REDIRECT is not true"
    echo "Setting to true..."
    sed -i 's/NEXT_PUBLIC_USE_AUTH_REDIRECT=.*/NEXT_PUBLIC_USE_AUTH_REDIRECT=true/' .env.local
    echo "✅ Set USE_AUTH_REDIRECT to true"
fi

echo "✅ .env.local is correctly configured"
echo ""

# Step 2: Verify next.config.js
echo "Step 2: Verifying next.config.js..."
echo "------------------------------------------------------------"

if grep -q "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" next.config.js; then
    echo "✅ next.config.js has Firebase env vars"
else
    echo "❌ ERROR: next.config.js doesn't have Firebase env vars"
    echo "This should have been fixed. Please check next.config.js"
    exit 1
fi

echo ""

# Step 3: Clean everything
echo "Step 3: Cleaning all caches and build artifacts..."
echo "------------------------------------------------------------"

echo "Removing .next directory..."
rm -rf .next

echo "Removing node_modules/.cache..."
rm -rf node_modules/.cache

echo "Removing out directory..."
rm -rf out

echo "✅ All caches cleaned"
echo ""

# Step 4: Build
echo "Step 4: Building application with custom domain..."
echo "------------------------------------------------------------"
echo "This will take 1-2 minutes..."
echo ""

# Export env vars to ensure they're available during build
export NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAhQqAlas0zbHcmTWLzceEdJ9gYPhxTl20
export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.remote-works.io
export NEXT_PUBLIC_FIREBASE_PROJECT_ID=remote-worksio
export NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=remote-worksio.firebasestorage.app
export NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=706683337174
export NEXT_PUBLIC_FIREBASE_APP_ID=1:706683337174:web:f66430adc232b56c794c77
export NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-44RTK1LJ30
export NEXT_PUBLIC_SITE_URL=https://www.remote-works.io
export NEXT_PUBLIC_USE_AUTH_REDIRECT=true

npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully"
else
    echo ""
    echo "❌ Build failed"
    exit 1
fi

echo ""

# Step 5: Verify build output
echo "Step 5: Verifying build contains custom domain..."
echo "------------------------------------------------------------"

if [ -d ".next" ]; then
    if grep -r "www.remote-works.io" .next/ >/dev/null 2>&1; then
        echo "✅ Custom domain found in .next build"
    else
        echo "❌ WARNING: Custom domain NOT found in .next build"
        echo "The build may not have picked up environment variables"
    fi
fi

if [ -d "out" ]; then
    if grep -r "www.remote-works.io" out/ >/dev/null 2>&1; then
        echo "✅ Custom domain found in out/ export"
    else
        echo "❌ WARNING: Custom domain NOT found in out/ export"
    fi
fi

echo ""

# Step 6: Final verification
echo "Step 6: Final Verification"
echo "------------------------------------------------------------"
echo ""
echo "✅ Configuration is complete!"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. START DEVELOPMENT SERVER:"
echo "   npm run dev"
echo ""
echo "2. TEST IN BROWSER:"
echo "   • Open INCOGNITO/PRIVATE window"
echo "   • Visit: http://localhost:3000/register"
echo "   • Open Console (F12)"
echo "   • Look for: 'OAuth Config: { authDomain: \"www.remote-works.io\" }'"
echo "   • Click 'Continue with Google'"
echo "   • OAuth should redirect through www.remote-works.io"
echo ""
echo "3. VERIFY GOOGLE OAUTH SETTINGS (CRITICAL):"
echo "   URL: https://console.cloud.google.com/apis/credentials?project=remote-worksio"
echo ""
echo "   Authorized redirect URIs must include:"
echo "   • https://www.remote-works.io/__/auth/handler"
echo "   • https://remote-works.io/__/auth/handler"
echo ""
echo "   If not added, OAuth will fail with 'redirect_uri_mismatch'"
echo ""
echo "4. IF USERS STILL GET STUCK ON REGISTER PAGE:"
echo "   • Check browser console for errors"
echo "   • Verify redirect result is found"
echo "   • Try different browser"
echo "   • Clear ALL browser data and try again"
echo ""
echo "=========================================================="
echo "Ready to test!"
echo "=========================================================="

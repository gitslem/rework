# OAuth Mobile Sign-Up Fix - Complete Guide

## 🔍 Root Cause Analysis

The issue where mobile users get stuck on the sign-up page after selecting Google OAuth was caused by:

1. **Missing `.env.local` file** - The app was using fallback authDomain `demo.firebaseapp.com`
2. **Incorrect template format** - `.env.example` and `.env.local.template` contained JavaScript code instead of environment variables
3. **OAuth redirect mismatch** - The authDomain used during sign-in didn't match the configured Firebase project

## ✅ What Was Fixed

### 1. Created Proper `.env.local` File
Location: `/home/user/rework/frontend/.env.local`

This file now contains the correct Firebase configuration with:
- **authDomain**: `remote-worksio.firebaseapp.com` (the default Firebase domain)
- All other Firebase credentials from your project
- `NEXT_PUBLIC_USE_AUTH_REDIRECT=true` for mobile compatibility

### 2. Fixed Template Files
Updated both `.env.example` and `.env.local.template` to use proper environment variable format instead of JavaScript code.

### 3. OAuth Flow Now Works
- Desktop: Uses popup mode (faster)
- Mobile: Automatically switches to redirect mode (more reliable)
- Both flows now use the correct authDomain

## 🚨 REQUIRED: Google Cloud Console Configuration

**CRITICAL:** You must configure OAuth redirect URIs in Google Cloud Console for authentication to work.

### Step 1: Access Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Select your Firebase project: `remote-worksio`
3. Navigate to: **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth 2.0 Client ID

Look for the OAuth client ID that Firebase created. It's usually named:
- "Web client (auto created by Google Service)"
- Or similar

Click on it to edit.

### Step 3: Configure Authorized JavaScript Origins

Add these origins (if not already present):

```
http://localhost:3000
https://localhost:3000
https://remote-worksio.firebaseapp.com
https://remote-worksio.web.app
https://remote-works.io
```

### Step 4: Configure Authorized Redirect URIs

**CRITICAL - Add ALL of these:**

```
http://localhost/__/auth/handler
http://localhost:3000/__/auth/handler
https://localhost:3000/__/auth/handler
https://remote-worksio.firebaseapp.com/__/auth/handler
https://remote-worksio.web.app/__/auth/handler
```

**For production (when using custom domain):**
```
https://remote-works.io/__/auth/handler
```

### Step 5: Save Changes

1. Click **SAVE** at the bottom
2. **Wait 5-10 minutes** for changes to propagate through Google's systems

## 🔧 Firebase Console Configuration

### Step 1: Add Authorized Domains

1. Go to: https://console.firebase.google.com/
2. Select project: `remote-worksio`
3. Navigate to: **Authentication** → **Settings** → **Authorized domains**
4. Ensure these domains are listed:

```
localhost
remote-worksio.firebaseapp.com
remote-worksio.web.app
```

**For production (when custom domain is ready):**
```
remote-works.io
```

5. If any are missing, click **Add domain** and add them

## 📱 How the Mobile Fix Works

### Before the Fix:
1. User clicks "Sign in with Google" on mobile
2. App tries to use authDomain `demo.firebaseapp.com`
3. Google redirects user back
4. Firebase can't verify the redirect (domain mismatch)
5. `getRedirectResult()` returns `null`
6. User stuck on sign-up page

### After the Fix:
1. User clicks "Sign in with Google" on mobile
2. App uses correct authDomain `remote-worksio.firebaseapp.com`
3. Mobile device automatically uses redirect flow (configured in `auth.ts`)
4. Role is stored in `sessionStorage` before redirect
5. Google authenticates and redirects back to the correct domain
6. `handleRedirectResult()` successfully retrieves user data
7. User is redirected to complete-profile or dashboard based on role

## 🧪 Testing Instructions

### Test on Mobile (iPhone, Android):

1. Clear browser cache and cookies
2. Visit: http://localhost:3000/register
3. Click "Continue with Google"
4. Select your Google account
5. You should be redirected back and see one of:
   - Complete-profile form (for new candidates)
   - Agent signup form (for agents)
   - Dashboard (if profile already exists)

### Test on Desktop:

1. Clear browser cache and cookies
2. Visit: http://localhost:3000/register
3. Click "Continue with Google"
4. A popup should appear (not redirect)
5. Select your Google account
6. Popup closes and you're redirected appropriately

## 🐛 Troubleshooting

### Issue: "redirect_uri_mismatch" Error

**Cause:** The OAuth redirect URI is not configured in Google Cloud Console

**Fix:**
1. Check the error URL - it will show which URI was attempted
2. Add that exact URI to Google Cloud Console → Credentials → Authorized redirect URIs
3. Wait 5-10 minutes
4. Try again

### Issue: Still Getting "Redirect result: None"

**Cause:** Changes haven't propagated or cache issue

**Fix:**
1. Clear browser cache and cookies completely
2. Restart your development server:
   ```bash
   cd /home/user/rework/frontend
   rm -rf .next
   npm run dev
   ```
3. Wait 10 minutes after changing Google OAuth settings
4. Try in incognito/private mode

### Issue: Works on Desktop but Not Mobile

**Cause:** Mobile browsers may handle cookies differently

**Fix:**
1. Ensure `NEXT_PUBLIC_USE_AUTH_REDIRECT=true` in `.env.local`
2. Check that all redirect URIs are configured in Google Cloud Console
3. Test in different mobile browsers (Safari, Chrome, Firefox)
4. Check browser console logs on mobile (use remote debugging)

### Issue: "Firebase is not configured" Error

**Cause:** `.env.local` file is missing or has incorrect values

**Fix:**
1. Verify `/home/user/rework/frontend/.env.local` exists
2. Check all Firebase credentials match your project
3. Restart the development server
4. Clear `.next` folder: `rm -rf .next`

## 📝 Console Logs for Debugging

When testing, check the browser console for these key logs:

**Successful Flow:**
```
=== REGISTER PAGE LOADED ===
Checking for redirect result...
=== handleRedirectResult called ===
Getting redirect result from Firebase...
Redirect result: Found
Redirect user found: user@example.com
Pending role from sessionStorage: candidate
User exists: true
Returning existing user: user@example.com Role: candidate
REDIRECT: Profile complete, going to dashboard
```

**Failed Flow (before fix):**
```
=== REGISTER PAGE LOADED ===
Checking for redirect result...
=== handleRedirectResult called ===
Getting redirect result from Firebase...
Redirect result: None
No redirect result or user
handleRedirectResult returned: null
No redirect user found
```

## 🎯 Key Files Modified

1. `/home/user/rework/frontend/.env.local` - **CREATED**
2. `/home/user/rework/frontend/.env.example` - Updated to proper format
3. `/home/user/rework/frontend/.env.local.template` - Updated to proper format

## 🔐 Security Notes

- `.env.local` is in `.gitignore` - it will NOT be committed to git
- Never share your Firebase API keys publicly
- The API key in `.env.local` is safe for client-side use (Firebase has security rules)
- For production, consider using Firebase App Check for additional security

## ✨ About Custom Domain (remote-works.io)

**Current Setup:** Using `remote-worksio.firebaseapp.com` as authDomain

**To Use Custom Domain Later:**

1. Complete Firebase Hosting setup
2. Configure DNS records
3. Wait for SSL certificate provisioning
4. Update `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=remote-works.io
   ```
5. Add to Google OAuth redirect URIs:
   ```
   https://remote-works.io/__/auth/handler
   ```
6. Rebuild and deploy

See `FIREBASE_SETUP.md` for detailed custom domain instructions.

## 📞 Support

If issues persist after following this guide:

1. Check Firebase Console → Authentication → Errors for specific error codes
2. Check browser console for detailed error messages
3. Verify all steps in Google Cloud Console were completed
4. Wait at least 10 minutes after changing OAuth settings

---

**Last Updated:** 2025-11-30
**Status:** ✅ Fixed - Ready for Testing

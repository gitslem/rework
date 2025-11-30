# OAuth Redirect Flow - Complete Fix for Custom Domain

## 🔍 Issues Identified and Fixed

### Issue 1: Users Still See Firebase Domain Instead of Custom Domain

**Root Cause:**
Even though `authDomain` is set to `www.remote-works.io` in `.env.local`, users were still seeing `remote-worksio.firebaseapp.com` during Google sign-in.

**Why This Happens:**
The `authDomain` setting in Firebase config determines which domain handles the OAuth redirect callback (`/__/auth/handler`). However, for a custom domain to actually work, you MUST:

1. **Have Firebase Hosting properly configured** with your custom domain
2. **Have DNS records pointing** to Firebase Hosting servers
3. **Have an active SSL certificate** provisioned by Firebase
4. **Have the custom domain verified** in Firebase Console

**Without these in place**, even if you set `authDomain: "www.remote-works.io"`, Firebase will fall back to using the default Firebase domain because that's where the hosting is active and where the `/__/auth/handler` endpoint exists.

**The Fix:**
See section "Setting Up Custom Domain for OAuth" below.

---

### Issue 2: Users Return to Register Page Instead of Going to Forms

**Root Cause:**
Multiple issues were causing this:

1. **Environment variable not respected**: The code wasn't checking `NEXT_PUBLIC_USE_AUTH_REDIRECT=true`, so it would try popup mode on desktop, which may fail or behave unexpectedly
2. **Redirect result not captured on page reload**: After OAuth redirect, if the user refreshed or came back to the page, the redirect result might have already been consumed
3. **Missing auth state check**: The code didn't check if a user was already signed in but just needed to complete their profile

**The Fixes Applied:**

#### Fix 1: Make Code Respect Environment Variable
**File: `frontend/src/lib/firebase/auth.ts`**

Added code to check `NEXT_PUBLIC_USE_AUTH_REDIRECT` environment variable:

```typescript
// Check environment variable for redirect mode
const envUseRedirect = typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_USE_AUTH_REDIRECT === 'true';

// Use redirect mode if:
// 1. Environment variable is set to true (for custom domain)
// 2. OR explicitly requested via parameter
// 3. OR on mobile device
const shouldUseRedirect = envUseRedirect || useRedirect || isMobileDevice();
```

Now the OAuth flow will ALWAYS use redirect mode when `NEXT_PUBLIC_USE_AUTH_REDIRECT=true`, which is required for custom domain OAuth.

#### Fix 2: Enhanced Logging for Debugging
Added comprehensive console logging to track:
- OAuth configuration (redirect vs popup)
- Auth domain being used
- Session storage role
- Redirect result details
- Profile data and routing decisions

#### Fix 3: Handle Already-Signed-In Users
**File: `frontend/src/pages/register.tsx`**

Added logic to check if user is already signed in (after redirect) but the redirect result has been consumed:

```typescript
// If no redirect result but user is signed in, check current auth state
if (!redirectUser && isFirebaseConfigured) {
  const auth = getFirebaseAuth();
  if (auth.currentUser && !hasHandledRedirect) {
    console.log('No redirect result but user is signed in');
    // Check their profile and redirect appropriately
  }
}
```

This ensures that even if the redirect result is not available, we still redirect signed-in users to the appropriate page.

---

## 🔧 What Was Changed

### Files Modified:

1. **`frontend/src/lib/firebase/auth.ts`**
   - Added environment variable check for redirect mode
   - Enhanced logging in `signInWithGoogle()`
   - Enhanced logging in `handleRedirectResult()`
   - Added check for already-signed-in users

2. **`frontend/src/pages/register.tsx`**
   - Added fallback logic for already-signed-in users
   - Enhanced logging for debugging
   - Better handling of auth state

---

## 🚀 Setting Up Custom Domain for OAuth

To actually use `www.remote-works.io` instead of the Firebase domain during OAuth, you MUST complete these steps:

### Step 1: Configure Firebase Hosting

```bash
cd /home/user/rework/frontend

# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting
firebase init hosting
```

**When prompted:**
- Public directory: `out` (for Next.js static export) or `.next` (for SSR)
- Configure as single-page app: `Yes`
- Set up GitHub Actions: `No` (or Yes if you want)

### Step 2: Add Custom Domain in Firebase Console

1. Go to: https://console.firebase.google.com/project/remote-worksio/hosting/sites
2. Click **Add custom domain**
3. Enter: `www.remote-works.io`
4. Firebase will provide DNS records (see next step)

### Step 3: Configure DNS Records

At your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.), add the DNS records that Firebase provides.

**Typical format (Firebase will provide exact values):**

```
Type: A
Name: www
Value: 151.101.1.195
       151.101.65.195

Type: TXT
Name: @
Value: firebase-verification=abc123xyz (Firebase provides this)
```

**For apex domain (optional):**

```
Type: A
Name: @
Value: 151.101.1.195
       151.101.65.195
```

### Step 4: Wait for DNS Propagation

- **Typical time**: 2-6 hours
- **Maximum time**: Up to 48 hours
- **Check status**: https://dnschecker.org/?domain=www.remote-works.io

### Step 5: Wait for SSL Certificate

Firebase automatically provisions an SSL certificate after DNS is verified.

- **Typical time**: 15 minutes - 1 hour
- **Check status**: Firebase Console → Hosting → Custom domains
- **Should show**: "Connected" with green checkmark

### Step 6: Verify Configuration

Once SSL is active:

1. Visit: `https://www.remote-works.io`
2. Should see valid SSL certificate (padlock icon)
3. Try OAuth sign-in
4. OAuth flow should now go through `www.remote-works.io`

---

## 🧪 Testing the Fixes

### Test 1: Verify Environment Variable is Respected

1. Open browser console (F12)
2. Visit: http://localhost:3000/register
3. Click "Continue with Google"
4. Check console for:

```
OAuth Config: {
  useRedirect: false,
  envUseRedirect: true,
  isMobile: false,
  authDomain: "www.remote-works.io"
}
Using REDIRECT mode for OAuth
Stored pendingRole in sessionStorage: candidate
```

**Expected**: Should show `envUseRedirect: true` and use redirect mode.

### Test 2: Verify Redirect Flow Works

1. Clear browser cache and cookies
2. Visit: http://localhost:3000/register
3. Click "Continue with Google"
4. **Expected flow**:
   - Redirected away to Google sign-in
   - Select Google account
   - Redirected back to app
   - Console shows: "Redirect user found: [email]"
   - Automatically redirected to `/complete-profile` (for new users)

### Test 3: Verify Profile Completion Works

1. After signing in with Google
2. Should land on `/complete-profile` page
3. Fill out the form
4. Submit
5. Should be redirected to candidate dashboard

---

## 📊 OAuth Flow Diagram

### Without Custom Domain Hosting:

```
User clicks "Sign in with Google"
  ↓
Redirected to: accounts.google.com
  ↓
User selects account
  ↓
Google redirects to: https://remote-worksio.firebaseapp.com/__/auth/handler
  ↓  (Firebase default domain is used because custom domain hosting not set up)
Firebase processes OAuth
  ↓
Redirected back to: www.remote-works.io/register
  ↓
App checks redirect result
  ↓
User redirected to: /complete-profile
```

### With Custom Domain Hosting (Properly Configured):

```
User clicks "Sign in with Google"
  ↓
Redirected to: accounts.google.com
  ↓
User selects account
  ↓
Google redirects to: https://www.remote-works.io/__/auth/handler
  ↓  (Custom domain is used because hosting is configured)
Firebase processes OAuth on custom domain
  ↓
Redirected back to: www.remote-works.io/register
  ↓
App checks redirect result
  ↓
User redirected to: /complete-profile
```

**Key Difference:** The OAuth callback uses the custom domain throughout.

---

## ⚠️ IMPORTANT: Current State

### What's Working Now:

✅ Code respects `NEXT_PUBLIC_USE_AUTH_REDIRECT=true`
✅ Redirect flow properly handles OAuth returns
✅ Users are redirected to complete-profile after sign-in
✅ Enhanced logging for debugging
✅ Handles already-signed-in users

### What Still Shows Firebase Domain:

⚠️ **OAuth flow still uses `remote-worksio.firebaseapp.com`** during sign-in

**Why?** Firebase Hosting is not yet configured with your custom domain.

**To Fix:** Complete the "Setting Up Custom Domain for OAuth" steps above.

---

## 🎯 Quick Action Items

### Immediate (Already Done):
- [x] Code updated to respect redirect mode environment variable
- [x] Enhanced logging for debugging
- [x] Fixed redirect flow routing
- [x] Handle already-signed-in users

### To Use Custom Domain During OAuth (You Need To Do):
- [ ] Initialize Firebase Hosting (`firebase init hosting`)
- [ ] Add custom domain in Firebase Console
- [ ] Configure DNS records at domain registrar
- [ ] Wait for DNS propagation (2-48 hours)
- [ ] Wait for SSL certificate provisioning (15 min - 1 hour)
- [ ] Verify custom domain is "Connected" in Firebase
- [ ] Test OAuth flow - should now use custom domain

---

## 🐛 Troubleshooting

### Users still see Firebase domain during OAuth

**Check:**
1. Is Firebase Hosting configured? (`firebase list` should show your project)
2. Is custom domain added in Firebase Console → Hosting?
3. Are DNS records configured correctly? (Use dnschecker.org)
4. Is SSL certificate active? (Check Hosting dashboard)
5. Has it been 24+ hours since DNS configuration?

**Debug:**
```bash
# Check DNS resolution
nslookup www.remote-works.io

# Should return Firebase IPs:
# 151.101.1.195
# 151.101.65.195
```

### Users still return to register page instead of forms

**Check browser console for:**
```
=== REGISTER PAGE LOADED ===
Current URL: ...
SessionStorage pendingRole: candidate
Calling handleRedirectResult...
```

**If you see "No redirect result or user":**
- Check if `pendingRole` was stored in sessionStorage
- Check if user is signed in: Should see "But auth.currentUser exists"
- Verify profile data is being fetched correctly

**Clear browser state and try again:**
```javascript
// In browser console:
sessionStorage.clear();
localStorage.clear();
// Then reload and try OAuth again
```

---

## 📞 Support

If issues persist:

1. **Check browser console** for detailed logs
2. **Share console output** starting from "REGISTER PAGE LOADED"
3. **Check Firebase Console** → Authentication → Errors
4. **Verify all settings** in Google Cloud Console OAuth credentials

---

**Last Updated:** 2025-11-30
**Status:** ✅ Redirect Flow Fixed | ⚠️ Custom Domain OAuth Requires Hosting Setup

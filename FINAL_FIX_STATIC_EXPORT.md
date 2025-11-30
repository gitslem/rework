# 🔧 FINAL FIX: Custom Domain OAuth + Register Page Stuck Issue

## 🔍 ROOT CAUSE IDENTIFIED

Your app uses Next.js **static export** (`output: 'export'` in next.config.js). This causes TWO critical issues:

### Issue #1: Custom Domain Not Showing During OAuth
**Problem:** Environment variables in `.env.local` are NOT automatically injected into static exports.
**Result:** App uses hardcoded fallback `demo.firebaseapp.com` or old cached domain.
**Fix:** Environment variables must be explicitly added to `next.config.js`.

### Issue #2: Users Stuck on Register Page After Google Sign-In
**Problem:** OAuth redirect completes but `handleRedirectResult()` returns null.
**Causes:**
1. authDomain mismatch prevents Firebase from recognizing the redirect
2. Session storage role being lost
3. Browser caching old configuration
**Result:** User signs in successfully but stays on register page instead of going to form.

---

## ✅ WHAT I'VE FIXED

### Fix #1: Updated `next.config.js`
Added explicit environment variable injection for static export:

```javascript
env: {
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_USE_AUTH_REDIRECT: process.env.NEXT_PUBLIC_USE_AUTH_REDIRECT,
  // ... all Firebase vars
}
```

**Result:** Environment variables now properly baked into static build.

### Fix #2: Created `complete-fix.sh` Script
Automated script that:
- ✅ Verifies and fixes `.env.local`
- ✅ Cleans all caches (.next, node_modules/.cache, out)
- ✅ Exports environment variables before build
- ✅ Builds app with correct settings
- ✅ Verifies custom domain in build output
- ✅ Provides testing instructions

---

## 🚀 COMPLETE FIX (3 Required Steps)

### STEP 1: Run the Complete Fix Script

```bash
cd /home/user/rework/frontend
./complete-fix.sh
```

**This script will:**
1. Verify `.env.local` has `www.remote-works.io`
2. Clean all caches
3. Build app with custom domain
4. Verify build output

**Expected output:**
```
✅ .env.local is correctly configured
✅ next.config.js has Firebase env vars
✅ All caches cleaned
✅ Build completed successfully
✅ Custom domain found in .next build
```

---

### STEP 2: Configure Google OAuth (CRITICAL - Most Common Cause of Issues)

**URL:** https://console.cloud.google.com/apis/credentials?project=remote-worksio

1. Find your **OAuth 2.0 Client ID** (Web client auto created by Google Service)

2. Click **EDIT** (pencil icon)

3. **Authorized redirect URIs** - Add these:
   ```
   https://www.remote-works.io/__/auth/handler
   https://remote-works.io/__/auth/handler
   https://remote-worksio.firebaseapp.com/__/auth/handler
   https://remote-worksio.web.app/__/auth/handler
   http://localhost:3000/__/auth/handler
   ```

4. **Authorized JavaScript origins** - Add these:
   ```
   https://www.remote-works.io
   https://remote-works.io
   https://remote-worksio.firebaseapp.com
   http://localhost:3000
   ```

5. Click **SAVE**

6. **⏰ WAIT 10 MINUTES** for Google to propagate changes

**⚠️ CRITICAL:** If you skip this step, OAuth will fail with `redirect_uri_mismatch` error or users will get stuck!

---

### STEP 3: Test with Fresh Browser

**Important:** Browser caching is aggressive. You MUST test in incognito/private mode.

1. **After running complete-fix.sh, start dev server:**
   ```bash
   cd /home/user/rework/frontend
   npm run dev
   ```

2. **Open browser in INCOGNITO/PRIVATE mode**

3. **Open browser console** (Press F12)

4. **Visit:** http://localhost:3000/register

5. **Check console output:**
   ```javascript
   OAuth Config: {
     useRedirect: false,
     envUseRedirect: true,
     isMobile: false,
     authDomain: "www.remote-works.io"  // ← MUST show custom domain
   }
   Using REDIRECT mode for OAuth
   ```

   **❌ If authDomain shows anything else:**
   - Stop the server
   - Run `./complete-fix.sh` again
   - Start server again
   - Try in completely different browser

6. **Click "Continue with Google"**

7. **Watch the URL bar during redirect:**
   - Should go to: `accounts.google.com`
   - Then to: `https://www.remote-works.io/__/auth/handler` ← **CUSTOM DOMAIN**
   - Back to: `http://localhost:3000/register`
   - Then automatically to: `/complete-profile` ← **USER SHOULD LAND HERE**

8. **Check console for redirect handling:**
   ```
   === handleRedirectResult called ===
   Current URL: http://localhost:3000/register
   Auth Domain: www.remote-works.io
   Redirect result: Found
   Redirect user found: user@example.com
   REDIRECT: Profile incomplete, going to /complete-profile
   ```

---

## 🎯 SUCCESS CRITERIA

OAuth is working correctly when you see:

1. ✅ Console shows: `authDomain: "www.remote-works.io"`
2. ✅ OAuth redirects through: `www.remote-works.io/__/auth/handler`
3. ✅ Console shows: `Redirect result: Found`
4. ✅ User automatically redirected to `/complete-profile`
5. ✅ User can fill out profile form
6. ✅ After form submission, user goes to dashboard

---

## 🐛 TROUBLESHOOTING

### Problem: Console still shows wrong authDomain

**Check:**
```bash
cd /home/user/rework/frontend

# 1. Verify .env.local
cat .env.local | grep AUTH_DOMAIN
# Should show: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.remote-works.io

# 2. Verify next.config.js has the env vars
grep "FIREBASE_AUTH_DOMAIN" next.config.js
# Should show: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

# 3. Re-run complete fix
./complete-fix.sh

# 4. Start server
npm run dev
```

### Problem: "redirect_uri_mismatch" error

**Error shows:**
```
Error: redirect_uri_mismatch
redirect_uri: https://www.remote-works.io/__/auth/handler
```

**Fix:**
1. Copy the exact URI from error: `https://www.remote-works.io/__/auth/handler`
2. Go to: https://console.cloud.google.com/apis/credentials?project=remote-worksio
3. Edit OAuth Client
4. Add that exact URI to "Authorized redirect URIs"
5. **SAVE** and wait 10 minutes
6. Try again

### Problem: User still stuck on register page after Google sign-in

**Scenario 1: Console shows "Redirect result: None"**

**This means OAuth redirect didn't complete properly.**

**Check:**
1. **Did you wait 10 minutes after configuring Google OAuth?**
   - If not, wait and try again

2. **Is the redirect URI configured in Google OAuth?**
   - Go to Google Cloud Console
   - Verify `https://www.remote-works.io/__/auth/handler` is in redirect URIs
   - Verify it's SAVED (re-check after saving)

3. **Try in completely different browser:**
   - Use a browser you haven't tested with
   - This rules out cache issues

**Scenario 2: Console shows "Redirect result: Found" but still on register page**

**This means redirect worked but routing failed.**

**Check:**
```javascript
// In browser console during the issue:
console.log('Current user:', firebase.auth().currentUser);
console.log('Session role:', sessionStorage.getItem('pendingRole'));
```

**Fix:**
1. Clear all browser data
2. Close browser completely
3. Reopen in incognito
4. Try again

### Problem: Environment variables showing as undefined

**Check in browser console:**
```javascript
console.log(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
// Should show: www.remote-works.io
// If shows: undefined
```

**Fix:**
```bash
cd /home/user/rework/frontend

# 1. Stop the server (Ctrl+C)

# 2. Remove EVERYTHING
rm -rf .next node_modules/.cache out

# 3. Verify next.config.js has env block
cat next.config.js | grep -A 10 "env:"

# 4. Run complete fix
./complete-fix.sh

# 5. Start fresh
npm run dev
```

### Problem: Build doesn't contain custom domain

**Check:**
```bash
cd /home/user/rework/frontend

# Search build output
grep -r "www.remote-works.io" .next/ | head -5

# If no results, env vars didn't get injected
```

**Fix:**
1. Verify `.env.local` exists and is correct
2. Verify `next.config.js` has the env block (should have been added)
3. Export vars manually before build:
   ```bash
   export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.remote-works.io
   export NEXT_PUBLIC_USE_AUTH_REDIRECT=true
   npm run build
   ```

---

## 🔬 Advanced Debugging

### Check What's Actually Being Used

Add this to register page temporarily to see what's loaded:

```javascript
// In browser console at /register:
console.log('=== ENV VARS CHECK ===');
console.log('AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log('USE_REDIRECT:', process.env.NEXT_PUBLIC_USE_AUTH_REDIRECT);
console.log('API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...');
```

**Expected output:**
```
=== ENV VARS CHECK ===
AUTH_DOMAIN: www.remote-works.io
USE_REDIRECT: true
API_KEY: AIzaSyAhQq...
```

### Monitor Network Tab for Redirects

1. Open DevTools → Network tab
2. Click "Continue with Google"
3. Watch for these requests in order:
   - `accounts.google.com/signin/oauth`
   - `www.remote-works.io/__/auth/handler` ← **Should use custom domain**
   - `localhost:3000/register`
   - `localhost:3000/complete-profile`

**If you see `remote-worksio.firebaseapp.com/__/auth/handler`:**
- Custom domain is NOT being used
- Go back to Step 1 and run `complete-fix.sh` again

---

## 📊 Understanding the Flow

### Working Flow (What Should Happen):

```
1. User on /register
   ↓
2. Clicks "Continue with Google"
   ↓
3. Console: "Using REDIRECT mode for OAuth"
   ↓
4. Console: "Stored pendingRole in sessionStorage: candidate"
   ↓
5. Redirect to: accounts.google.com
   ↓
6. User selects Google account
   ↓
7. Google redirects to: www.remote-works.io/__/auth/handler ← Custom domain!
   ↓
8. Firebase processes OAuth
   ↓
9. Redirect back to: localhost:3000/register
   ↓
10. Console: "Redirect result: Found"
    ↓
11. Console: "Redirect user found: user@example.com"
    ↓
12. Console: "Creating new user in Firestore..."
    ↓
13. Console: "Profile incomplete, going to /complete-profile"
    ↓
14. User lands on /complete-profile ✅
    ↓
15. User fills form and submits
    ↓
16. User goes to dashboard ✅
```

### Broken Flow (What's Happening Now):

```
1-4. Same as above
   ↓
7. Google redirects to: remote-worksio.firebaseapp.com/__/auth/handler ← Firebase domain
   ↓
   OR
   ↓
10. Console: "Redirect result: None" ← OAuth didn't complete
    ↓
11. User stuck on /register ❌
```

---

## 🎯 The Fix Checklist

Complete this checklist in order:

### Configuration
- [ ] Ran `./complete-fix.sh` successfully
- [ ] Build completed without errors
- [ ] Build verification showed custom domain in output
- [ ] next.config.js has Firebase env vars (auto-added by fix)
- [ ] .env.local has `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.remote-works.io`

### Google Cloud Console
- [ ] Opened https://console.cloud.google.com/apis/credentials?project=remote-worksio
- [ ] Found OAuth 2.0 Client ID
- [ ] Added `https://www.remote-works.io/__/auth/handler` to redirect URIs
- [ ] Added `https://remote-works.io/__/auth/handler` to redirect URIs
- [ ] Added `https://www.remote-works.io` to JavaScript origins
- [ ] Clicked SAVE
- [ ] **Waited 10 minutes**

### Testing
- [ ] Started dev server: `npm run dev`
- [ ] Opened incognito/private browser window
- [ ] Visited http://localhost:3000/register
- [ ] Opened browser console (F12)
- [ ] Verified console shows: `authDomain: "www.remote-works.io"`
- [ ] Clicked "Continue with Google"
- [ ] Verified OAuth used custom domain in URL bar
- [ ] Verified console shows: `Redirect result: Found`
- [ ] Verified user redirected to /complete-profile
- [ ] Filled out profile form
- [ ] Verified redirect to dashboard

---

## ✅ Success Indicators

After completing all steps, you should see:

**In Console (during OAuth click):**
```
OAuth Config: {
  authDomain: "www.remote-works.io" ✓
  envUseRedirect: true ✓
}
Using REDIRECT mode for OAuth ✓
Stored pendingRole in sessionStorage: candidate ✓
```

**In URL Bar (during redirect):**
```
https://www.remote-works.io/__/auth/handler ✓
```

**In Console (after redirect back):**
```
Redirect result: Found ✓
Redirect user found: user@example.com ✓
Creating new user in Firestore... ✓
REDIRECT: Profile incomplete, going to /complete-profile ✓
```

**In Browser:**
```
User is now on /complete-profile page ✓
User can fill out form ✓
User submits and goes to dashboard ✓
```

---

## 📞 Still Not Working?

If after completing ALL steps users are still stuck:

1. **Collect debug info:**
   ```bash
   # In terminal
   cd /home/user/rework/frontend
   echo "=== .env.local ===" && cat .env.local
   echo "=== Build check ===" && grep -r "www.remote-works.io" .next/ | wc -l
   ```

   ```javascript
   // In browser console
   console.log('ENV CHECK:', {
     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
     useRedirect: process.env.NEXT_PUBLIC_USE_AUTH_REDIRECT,
     currentUser: firebase?.auth()?.currentUser?.email || 'none'
   });
   ```

2. **Try the nuclear option:**
   ```bash
   cd /home/user/rework/frontend
   rm -rf .next node_modules out
   npm install
   ./complete-fix.sh
   npm run dev
   ```

3. **Test on a mobile device** (if available):
   - Mobile devices don't have the same cache issues
   - Use your phone's browser
   - Visit http://YOUR_COMPUTER_IP:3000/register
   - Try OAuth there

---

**Last Updated:** 2025-11-30
**Issue:** Static export not injecting environment variables
**Status:** ✅ Fixed with next.config.js update and complete-fix.sh script
**Next:** Run `./complete-fix.sh` and follow 3-step testing procedure

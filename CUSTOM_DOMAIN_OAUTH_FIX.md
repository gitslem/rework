# Custom Domain OAuth Not Working - Complete Fix

## ✅ Current Status

Firebase Hosting shows both custom domains are **Connected**:
- ✅ `www.remote-works.io` - Connected
- ✅ `remote-works.io` - Connected
- ✅ `remote-worksio.firebaseapp.com` - Default
- ✅ `remote-worksio.web.app` - Default

## 🔍 Why Custom Domain Still Shows Firebase Domain

Even though your custom domains are connected, OAuth might still use Firebase domain due to:

1. **App not rebuilt** after `.env.local` changes
2. **Browser caching** old configuration
3. **Google OAuth settings** missing custom domain redirect URIs
4. **Firebase Authentication** missing authorized domains
5. **DNS propagation** not complete (unlikely since "Connected")

---

## 🚀 IMMEDIATE FIX - Follow These Steps

### Step 1: Verify Google Cloud Console OAuth Settings

**CRITICAL:** This is the most common reason custom domain OAuth doesn't work.

1. Go to: https://console.cloud.google.com/apis/credentials?project=remote-worksio

2. Click on your **OAuth 2.0 Client ID** (Web client auto created by Google Service)

3. Under **Authorized JavaScript origins**, ensure you have:
   ```
   https://www.remote-works.io
   https://remote-works.io
   https://remote-worksio.firebaseapp.com
   https://remote-worksio.web.app
   http://localhost:3000
   ```

4. Under **Authorized redirect URIs**, ensure you have:
   ```
   https://www.remote-works.io/__/auth/handler
   https://remote-works.io/__/auth/handler
   https://remote-worksio.firebaseapp.com/__/auth/handler
   https://remote-worksio.web.app/__/auth/handler
   http://localhost:3000/__/auth/handler
   http://localhost/__/auth/handler
   ```

5. Click **SAVE**

6. **WAIT 10 MINUTES** for Google to propagate the changes

---

### Step 2: Verify Firebase Authentication Authorized Domains

1. Go to: https://console.firebase.google.com/project/remote-worksio/authentication/settings

2. Click on **Authorized domains** tab

3. Ensure these domains are listed:
   ```
   www.remote-works.io
   remote-works.io
   localhost
   remote-worksio.firebaseapp.com
   remote-worksio.web.app
   ```

4. If `www.remote-works.io` or `remote-works.io` are missing:
   - Click **Add domain**
   - Enter the domain
   - Click **Add**

---

### Step 3: Clean Build and Restart Development Server

**CRITICAL:** The app must be rebuilt to pick up environment variable changes.

```bash
cd /home/user/rework/frontend

# Clean all caches
rm -rf .next
rm -rf node_modules/.cache

# Rebuild application
npm run build

# Start development server
npm run dev
```

**OR use the automated script:**

```bash
cd /home/user/rework/frontend
chmod +x verify-oauth.sh
./verify-oauth.sh
```

---

### Step 4: Clear Browser Cache

**CRITICAL:** Your browser might be caching the old OAuth configuration.

**Option A: Use Incognito/Private Mode**
- Open a new incognito/private window
- Visit: http://localhost:3000/register
- Try OAuth sign-in

**Option B: Clear Browser Cache**
1. Open browser settings
2. Clear browsing data
3. Select: Cached images and files, Cookies
4. Time range: All time
5. Click Clear data

---

### Step 5: Test OAuth Flow

1. Open browser in **incognito mode**
2. Open **browser console** (F12)
3. Visit: http://localhost:3000/register
4. Click "Continue with Google"

**Check Console for:**
```javascript
OAuth Config: {
  useRedirect: false,
  envUseRedirect: true,
  isMobile: false,
  authDomain: "www.remote-works.io"  // ← Should show your custom domain
}
Using REDIRECT mode for OAuth
```

5. During OAuth flow, **check the URL bar**:
   - Should redirect to Google: `accounts.google.com`
   - Then redirect to: `https://www.remote-works.io/__/auth/handler`
   - NOT: `https://remote-worksio.firebaseapp.com/__/auth/handler`

---

## 🐛 Troubleshooting

### Issue: Console shows `authDomain: "undefined"` or wrong domain

**Fix:**
```bash
cd /home/user/rework/frontend

# Verify .env.local exists and has correct values
cat .env.local | grep AUTH_DOMAIN

# Should output: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.remote-works.io

# If not, fix it:
echo 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.remote-works.io' >> .env.local

# Clean and rebuild
rm -rf .next
npm run build
npm run dev
```

### Issue: OAuth still uses Firebase domain after all steps

**Possible Causes:**

1. **OAuth settings not saved in Google Cloud Console**
   - Go back and verify the redirect URIs are saved
   - Wait 10 more minutes

2. **Browser still caching**
   - Try different browser
   - Try incognito mode
   - Clear all cookies for localhost

3. **App not using environment variables**
   - Check console: `console.log(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)`
   - Should show: `www.remote-works.io`
   - If not, rebuild app

4. **Next.js static optimization**
   - Environment variables might not be injected in static pages
   - Make sure you're running `npm run dev` (not `npm start`)
   - Check `next.config.js` for any env blocking

### Issue: "redirect_uri_mismatch" Error

**Error shows:**
```
redirect_uri=https://www.remote-works.io/__/auth/handler
```

**Fix:**
1. Copy the exact URI from the error
2. Go to Google Cloud Console → OAuth Client
3. Add that exact URI to "Authorized redirect URIs"
4. Save and wait 10 minutes
5. Try again

### Issue: "Unauthorized domain: www.remote-works.io"

**Fix:**
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Click "Add domain"
3. Enter: `www.remote-works.io`
4. Click "Add"
5. Try immediately (no wait needed)

---

## 📊 Verification Checklist

Use this checklist to ensure everything is configured:

### Google Cloud Console
- [ ] Opened: https://console.cloud.google.com/apis/credentials?project=remote-worksio
- [ ] Found OAuth 2.0 Client ID
- [ ] Added `https://www.remote-works.io` to JavaScript origins
- [ ] Added `https://remote-works.io` to JavaScript origins
- [ ] Added `https://www.remote-works.io/__/auth/handler` to redirect URIs
- [ ] Added `https://remote-works.io/__/auth/handler` to redirect URIs
- [ ] Clicked SAVE
- [ ] Waited 10 minutes

### Firebase Console
- [ ] Opened: https://console.firebase.google.com/project/remote-worksio/authentication/settings
- [ ] Verified `www.remote-works.io` in Authorized domains
- [ ] Verified `remote-works.io` in Authorized domains
- [ ] Hosting shows both domains as "Connected"

### Local Environment
- [ ] Verified `.env.local` has `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.remote-works.io`
- [ ] Verified `.env.local` has `NEXT_PUBLIC_USE_AUTH_REDIRECT=true`
- [ ] Deleted `.next` folder
- [ ] Deleted `node_modules/.cache`
- [ ] Ran `npm run build` successfully
- [ ] Started dev server with `npm run dev`

### Browser Testing
- [ ] Opened browser in incognito mode
- [ ] Cleared browser cache and cookies
- [ ] Opened browser console (F12)
- [ ] Visited http://localhost:3000/register
- [ ] Console shows `authDomain: "www.remote-works.io"`
- [ ] Console shows `envUseRedirect: true`
- [ ] Clicked "Continue with Google"
- [ ] OAuth redirect URL uses `www.remote-works.io`

---

## 🎯 Expected Behavior After Fix

### Before Fix (Using Firebase Domain):
```
User clicks "Sign in with Google"
  ↓
Redirect to: accounts.google.com
  ↓
Redirect to: https://remote-worksio.firebaseapp.com/__/auth/handler
  ↓
Redirect to: www.remote-works.io/register
  ↓
Complete profile
```

### After Fix (Using Custom Domain):
```
User clicks "Sign in with Google"
  ↓
Redirect to: accounts.google.com
  ↓
Redirect to: https://www.remote-works.io/__/auth/handler  ← Custom domain!
  ↓
Redirect to: www.remote-works.io/register
  ↓
Complete profile
```

**Key Difference:** The OAuth callback now uses your custom domain throughout.

---

## 🔬 Advanced Debugging

### Check Environment Variables in Build

```bash
cd /home/user/rework/frontend

# Check if env vars are in the build
grep -r "www.remote-works.io" .next/

# Should see multiple matches in .next/ files
```

### Check Environment Variables in Browser

```javascript
// In browser console at http://localhost:3000/register
console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log('Use Redirect:', process.env.NEXT_PUBLIC_USE_AUTH_REDIRECT);

// Should output:
// Auth Domain: www.remote-works.io
// Use Redirect: true
```

### Monitor Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Click "Continue with Google"
4. Watch for redirects:
   - Should see redirect to `accounts.google.com`
   - Then redirect to `www.remote-works.io/__/auth/handler`
   - If you see `remote-worksio.firebaseapp.com`, custom domain is not working

---

## 📞 Still Not Working?

If after completing ALL steps above, OAuth still uses Firebase domain:

### Collect Debug Information:

1. **Browser Console Output:**
   ```javascript
   // Copy output of these commands from browser console:
   console.log(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
   console.log(process.env.NEXT_PUBLIC_USE_AUTH_REDIRECT);
   ```

2. **Environment File:**
   ```bash
   cat /home/user/rework/frontend/.env.local
   ```

3. **Google OAuth Settings:**
   - Screenshot of "Authorized JavaScript origins"
   - Screenshot of "Authorized redirect URIs"

4. **Firebase Authorized Domains:**
   - Screenshot of authorized domains list

5. **Network Tab:**
   - Screenshot showing OAuth redirect URLs

### Common Root Causes:

1. **Next.js not picking up .env.local:**
   - Solution: Rename to `.env.production.local` or use `publicRuntimeConfig`

2. **Build optimization removing env vars:**
   - Solution: Check `next.config.js` for `env` or `publicRuntimeConfig` settings

3. **Multiple OAuth clients:**
   - Solution: Verify you're editing the correct OAuth client ID used by Firebase

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Browser console shows: `authDomain: "www.remote-works.io"`
2. ✅ During OAuth, URL bar shows: `www.remote-works.io/__/auth/handler`
3. ✅ No "redirect_uri_mismatch" errors
4. ✅ No "unauthorized domain" errors
5. ✅ Users successfully sign in and reach profile completion form
6. ✅ All OAuth branding shows your custom domain

---

**Last Updated:** 2025-11-30
**Status:** Custom domains Connected in Firebase Hosting ✓
**Next:** Configure Google OAuth and rebuild app

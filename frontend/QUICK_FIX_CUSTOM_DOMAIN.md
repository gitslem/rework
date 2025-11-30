# 🚀 QUICK FIX: Custom Domain OAuth (5 Minutes)

Your Firebase Hosting shows domains are Connected ✅
Now fix OAuth to use custom domain instead of Firebase domain.

---

## ⚡ Step 1: Configure Google OAuth (CRITICAL)

**URL:** https://console.cloud.google.com/apis/credentials?project=remote-worksio

1. Click on **OAuth 2.0 Client ID** (Web client auto created by Google Service)

2. **Authorized JavaScript origins** - Add these 5 origins:
   ```
   https://www.remote-works.io
   https://remote-works.io
   https://remote-worksio.firebaseapp.com
   https://remote-worksio.web.app
   http://localhost:3000
   ```

3. **Authorized redirect URIs** - Add these 6 URIs:
   ```
   https://www.remote-works.io/__/auth/handler
   https://remote-works.io/__/auth/handler
   https://remote-worksio.firebaseapp.com/__/auth/handler
   https://remote-worksio.web.app/__/auth/handler
   http://localhost:3000/__/auth/handler
   http://localhost/__/auth/handler
   ```

4. Click **SAVE**

5. **⏰ WAIT 10 MINUTES** for Google to propagate changes

---

## ⚡ Step 2: Configure Firebase Authorized Domains

**URL:** https://console.firebase.google.com/project/remote-worksio/authentication/settings

1. Click **Authorized domains** tab

2. Verify these domains are listed:
   - ✅ `www.remote-works.io`
   - ✅ `remote-works.io`
   - ✅ `localhost`

3. If missing, click **Add domain** and add them

---

## ⚡ Step 3: Rebuild Application

**CRITICAL:** App must be rebuilt to pick up .env.local changes

```bash
cd /home/user/rework/frontend

# Clean caches
rm -rf .next
rm -rf node_modules/.cache

# Rebuild
npm run build

# Start dev server
npm run dev
```

**OR use automated script:**
```bash
cd /home/user/rework/frontend
./verify-oauth.sh
```

---

## ⚡ Step 4: Test in Incognito Mode

1. **Open browser in incognito/private mode** (to avoid cache)

2. **Open browser console** (Press F12)

3. **Visit:** http://localhost:3000/register

4. **Check console output:**
   ```
   OAuth Config: {
     authDomain: "www.remote-works.io"  ← Must show custom domain
     envUseRedirect: true
   }
   ```

5. **Click "Continue with Google"**

6. **Watch URL bar during redirect:**
   - Should go to: `accounts.google.com`
   - Then to: `https://www.remote-works.io/__/auth/handler` ← Custom domain!
   - NOT: `https://remote-worksio.firebaseapp.com/__/auth/handler`

---

## ✅ Success Check

It's working if:
- ✅ Console shows: `authDomain: "www.remote-works.io"`
- ✅ URL bar shows: `www.remote-works.io/__/auth/handler` during OAuth
- ✅ No errors
- ✅ User reaches profile completion form

---

## 🐛 Still Not Working?

### If console shows wrong authDomain:

```bash
# Verify .env.local
cat /home/user/rework/frontend/.env.local | grep AUTH_DOMAIN

# Should show: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.remote-works.io

# Rebuild
cd /home/user/rework/frontend
rm -rf .next && npm run build && npm run dev
```

### If getting "redirect_uri_mismatch" error:

1. Copy the exact URI from the error message
2. Add it to Google OAuth redirect URIs
3. Save and wait 10 minutes

### If still using Firebase domain after 10+ minutes:

1. **Clear browser completely:**
   - Close all browser windows
   - Reopen in incognito
   - Try again

2. **Try different browser:**
   - Use a browser you haven't tested with
   - This confirms it's not a cache issue

3. **Verify Google OAuth settings saved:**
   - Go back to Google Cloud Console
   - Verify the custom domain URIs are there
   - If not, they didn't save - try again

---

## 📞 Need Help?

See full documentation: `CUSTOM_DOMAIN_OAUTH_FIX.md`

---

**Estimated Time:** 15 minutes (including 10 min wait for Google propagation)
**Last Updated:** 2025-11-30

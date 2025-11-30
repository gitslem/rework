# Custom Domain Setup Verification - www.remote-works.io

## ✅ Configuration Updated

Your project has been configured to use **`www.remote-works.io`** as the custom authDomain.

**Project Details:**
- Project ID: `remote-worksio`
- Project Number: `706683337174`
- Custom Domain: `www.remote-works.io`

---

## 🔧 REQUIRED CONFIGURATIONS

To make OAuth authentication work with your custom domain, you **MUST** complete ALL of the following steps:

---

### 1. ✅ Firebase Console - Authorized Domains

**URL:** https://console.firebase.google.com/project/remote-worksio/authentication/settings

**Steps:**
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Ensure these domains are added:

```
localhost
www.remote-works.io
remote-works.io
remote-worksio.firebaseapp.com
remote-worksio.web.app
```

3. If missing, click **Add domain** and add:
   - `www.remote-works.io`
   - `remote-works.io` (without www)

**Why:** Firebase needs to whitelist domains that can handle OAuth redirects.

---

### 2. 🔥 Firebase Hosting - Custom Domain Setup

**URL:** https://console.firebase.google.com/project/remote-worksio/hosting/sites

**Steps:**

#### A. Initialize Firebase Hosting (if not done)

```bash
cd /home/user/rework/frontend

# Install Firebase CLI if needed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting
```

**When prompted:**
- Select project: `remote-worksio`
- Public directory: `out` or `.next`
- Single-page app: `Yes`
- Automatic builds: `No`

#### B. Add Custom Domain in Firebase Console

1. Go to **Hosting** → Click on your site
2. Click **Add custom domain**
3. Enter: `www.remote-works.io`
4. Firebase will provide DNS records (see Step 3)
5. Also add: `remote-works.io` (apex domain) if you want both www and non-www to work

**CRITICAL:** You need to add **both** domains:
- `www.remote-works.io` (primary)
- `remote-works.io` (redirects to www)

---

### 3. 🌐 DNS Configuration

**Configure these DNS records at your domain registrar** (e.g., GoDaddy, Namecheap, Cloudflare):

Firebase will provide specific IP addresses. Here's the typical format:

#### For www.remote-works.io:

```
Type: A
Name: www
TTL: 3600
Values (add ALL):
  151.101.1.195
  151.101.65.195
```

**OR if Firebase provides CNAME:**

```
Type: CNAME
Name: www
Value: remote-worksio.web.app
TTL: 3600
```

#### For remote-works.io (apex domain):

```
Type: A
Name: @
TTL: 3600
Values (add ALL):
  151.101.1.195
  151.101.65.195
```

#### Firebase Verification TXT Record:

```
Type: TXT
Name: @
Value: [Firebase will provide this - looks like "firebase-verification=abc123xyz"]
TTL: 3600
```

**IMPORTANT:**
- Copy the EXACT values from Firebase Console
- DNS propagation can take 24-48 hours
- Use https://dnschecker.org/ to verify propagation

---

### 4. 🔐 Google Cloud Console - OAuth Configuration

**URL:** https://console.cloud.google.com/apis/credentials?project=remote-worksio

**Steps:**

1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID (usually "Web client (auto created by Google Service)")
3. Click **Edit** (pencil icon)

#### A. Authorized JavaScript Origins

**Add ALL of these:**

```
https://www.remote-works.io
https://remote-works.io
https://remote-worksio.firebaseapp.com
https://remote-worksio.web.app
http://localhost:3000
https://localhost:3000
```

#### B. Authorized Redirect URIs

**Add ALL of these (CRITICAL):**

```
https://www.remote-works.io/__/auth/handler
https://remote-works.io/__/auth/handler
https://remote-worksio.firebaseapp.com/__/auth/handler
https://remote-worksio.web.app/__/auth/handler
http://localhost:3000/__/auth/handler
http://localhost/__/auth/handler
```

**⚠️ CRITICAL NOTES:**
- The redirect URIs must include `/__/auth/handler` (double underscore)
- HTTPS is required for production domains
- Keep Firebase default domains as fallback
- Click **SAVE** when done
- Wait 5-10 minutes for changes to propagate

---

### 5. 📋 Firebase Security Rules (IMPORTANT)

Ensure your Firestore and Storage have proper security rules:

**Firestore Rules:** https://console.firebase.google.com/project/remote-worksio/firestore/rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User document rules
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Profile document rules
    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Add other collection rules as needed
  }
}
```

**Storage Rules:** https://console.firebase.google.com/project/remote-worksio/storage/rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

### 6. 🔒 SSL Certificate

**Automatic:** Firebase will automatically provision an SSL certificate for your custom domain.

**Check Status:**
1. Go to Firebase Console → Hosting
2. Find your custom domain
3. Status should show:
   - ✅ **Connected** (domain is live with SSL)
   - ⏳ **Pending** (waiting for DNS or SSL)
   - ❌ **Needs Setup** (requires configuration)

**Timing:**
- After DNS verification: 15-60 minutes
- Full SSL provisioning: Can take up to 24 hours

---

## 🧪 VERIFICATION CHECKLIST

Use this checklist to ensure everything is configured correctly:

### Firebase Console Checklist

- [ ] **Authentication → Authorized domains**: Both `www.remote-works.io` and `remote-works.io` are listed
- [ ] **Hosting**: Custom domain added for `www.remote-works.io`
- [ ] **Hosting**: Custom domain added for `remote-works.io` (apex)
- [ ] **Hosting**: SSL certificate status shows "Connected"
- [ ] **Firestore → Rules**: Security rules are properly configured
- [ ] **Storage → Rules**: Security rules are properly configured

### Google Cloud Console Checklist

- [ ] **OAuth Client → JavaScript origins**: All 6 origins added (see Step 4A)
- [ ] **OAuth Client → Redirect URIs**: All 6 redirect URIs added (see Step 4B)
- [ ] **OAuth Client**: Clicked SAVE and waited 10 minutes

### DNS Checklist

- [ ] **A Record**: `www` points to Firebase IPs
- [ ] **A Record**: `@` (apex) points to Firebase IPs
- [ ] **TXT Record**: Firebase verification record added
- [ ] **DNS Propagation**: Verified at https://dnschecker.org/
- [ ] **Waited**: At least 24 hours for full propagation

### Local Configuration Checklist

- [ ] **`.env.local`**: authDomain is `www.remote-works.io`
- [ ] **`.env.local`**: SITE_URL is `https://www.remote-works.io`
- [ ] **`.env.local`**: USE_AUTH_REDIRECT is `true`
- [ ] **Build**: Deleted `.next` folder: `rm -rf .next`
- [ ] **Build**: Ran `npm run build` successfully
- [ ] **Server**: Development server restarted

---

## 🧪 TESTING PROCEDURE

### Step 1: DNS Verification

```bash
# Check if DNS is resolving
nslookup www.remote-works.io

# Should return Firebase IPs:
# 151.101.1.195
# 151.101.65.195
```

Or use online tool: https://dnschecker.org/?domain=www.remote-works.io

### Step 2: SSL Verification

Visit in browser:
```
https://www.remote-works.io
```

- Should show a valid SSL certificate (padlock icon)
- Certificate should be issued by "Google Trust Services"
- No security warnings

### Step 3: OAuth Flow Test

**On Desktop:**

1. Clear browser cache and cookies
2. Open browser console (F12)
3. Visit: https://www.remote-works.io/register
4. Click "Continue with Google"
5. Select your Google account

**Expected Flow:**
```
1. Click button
2. Redirect to www.remote-works.io (same domain)
3. Redirect to Google sign-in
4. Select account
5. Redirect back to www.remote-works.io/__/auth/handler
6. Redirect to complete-profile or dashboard
```

**Console Logs Should Show:**
```
=== REGISTER PAGE LOADED ===
Checking for redirect result...
=== handleRedirectResult called ===
Getting redirect result from Firebase...
Redirect result: Found
Redirect user found: user@example.com
```

**On Mobile (iPhone/Android):**

1. Clear browser cache
2. Open Safari/Chrome
3. Visit: https://www.remote-works.io/register
4. Click "Continue with Google"
5. Should redirect through Google and back successfully

---

## 🐛 TROUBLESHOOTING

### Issue: "redirect_uri_mismatch"

**Error in URL will show:**
```
redirect_uri=https://www.remote-works.io/__/auth/handler
```

**Fix:**
1. Go to Google Cloud Console → OAuth Client
2. Add the EXACT URI from the error to "Authorized redirect URIs"
3. Save and wait 10 minutes
4. Try again

### Issue: "Unauthorized domain"

**Fix:**
1. Firebase Console → Authentication → Authorized domains
2. Add `www.remote-works.io`
3. Try again immediately

### Issue: DNS Not Resolving

**Fix:**
1. Verify DNS records are correct at your registrar
2. Use `nslookup www.remote-works.io` to check
3. Wait 24-48 hours for propagation
4. Use https://dnschecker.org/ to check globally

### Issue: SSL Certificate Error

**Fix:**
1. Ensure DNS is fully propagated first
2. Wait 1-2 hours after DNS verification
3. Check Firebase Hosting status
4. If stuck "Pending" after 24 hours, contact Firebase Support

### Issue: "Redirect result: None" (still happening)

**Possible Causes:**
1. Google OAuth settings not saved/propagated yet → Wait 10 minutes
2. Custom domain not connected in Firebase → Check Hosting status
3. SSL certificate not ready → Check for HTTPS errors
4. Browser cache → Clear completely and try incognito mode
5. authDomain mismatch → Verify `.env.local` has `www.remote-works.io`

**Debug Steps:**
```bash
# Rebuild app
cd /home/user/rework/frontend
rm -rf .next
npm run build
npm run dev

# Check what authDomain is being used
# Open browser console and run:
console.log(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)

# Should output: www.remote-works.io
```

### Issue: Works with www but not without

**Fix:**
1. Add `remote-works.io` (without www) as second custom domain in Firebase
2. Add DNS A records for apex domain (@)
3. Add to Google OAuth settings:
   - Origin: `https://remote-works.io`
   - Redirect: `https://remote-works.io/__/auth/handler`

---

## 📊 Timeline Expectations

| Step | Time Required |
|------|---------------|
| Firebase configuration | Immediate |
| Google OAuth settings | 5-10 minutes to propagate |
| DNS record creation | Immediate to add |
| DNS propagation | 1-48 hours (typically 2-6 hours) |
| Firebase domain verification | After DNS propagation |
| SSL certificate provisioning | 15 minutes - 24 hours after DNS |
| Full OAuth flow working | After all above complete |

**Typical Total Time:** 2-24 hours from DNS configuration to fully working OAuth

---

## 🚀 DEPLOYMENT

Once everything is verified locally:

```bash
cd /home/user/rework/frontend

# Build production version
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Your site will be live at:
# https://www.remote-works.io
```

---

## 📝 Current Configuration Summary

**Environment Variables (`.env.local`):**
```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.remote-works.io
NEXT_PUBLIC_SITE_URL=https://www.remote-works.io
NEXT_PUBLIC_USE_AUTH_REDIRECT=true
```

**Required Google OAuth Redirect URIs:**
```
https://www.remote-works.io/__/auth/handler
https://remote-works.io/__/auth/handler
https://remote-worksio.firebaseapp.com/__/auth/handler
http://localhost:3000/__/auth/handler
```

**Required Firebase Authorized Domains:**
```
www.remote-works.io
remote-works.io
localhost
```

---

## ✅ Quick Verification Command

Run this to verify your local configuration:

```bash
cd /home/user/rework/frontend

echo "=== Local Configuration ==="
grep "FIREBASE_AUTH_DOMAIN" .env.local
grep "SITE_URL" .env.local
grep "USE_AUTH_REDIRECT" .env.local

echo ""
echo "Expected values:"
echo "✓ AUTH_DOMAIN should be: www.remote-works.io"
echo "✓ SITE_URL should be: https://www.remote-works.io"
echo "✓ USE_AUTH_REDIRECT should be: true"
```

---

## 📞 Need Help?

If you encounter issues:

1. **Check Firebase Console Errors:**
   - Authentication → Errors tab
   - Hosting → Domain status

2. **Check Browser Console:**
   - Look for specific error messages
   - Share console logs for debugging

3. **Verify Timing:**
   - Have you waited 10 minutes after OAuth changes?
   - Has DNS propagated? (Check dnschecker.org)
   - Is SSL certificate ready? (Check Firebase Hosting)

---

**Last Updated:** 2025-11-30
**Status:** ✅ Configured for Custom Domain (www.remote-works.io)
**Next Step:** Complete Firebase Hosting setup and verify DNS propagation

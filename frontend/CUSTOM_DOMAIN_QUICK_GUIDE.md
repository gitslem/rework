# Quick Setup Guide - Custom Domain OAuth

## 🎯 Your Configuration

**Custom Domain:** `www.remote-works.io`
**Project ID:** `remote-worksio`
**Project Number:** `706683337174`

---

## ⚡ CRITICAL: Google Cloud Console Setup

### 1. Go to OAuth Credentials

**URL:** https://console.cloud.google.com/apis/credentials?project=remote-worksio

### 2. Edit Your OAuth 2.0 Client ID

Click on "Web client (auto created by Google Service)"

### 3. Add These Authorized JavaScript Origins:

```
https://www.remote-works.io
https://remote-works.io
https://remote-worksio.firebaseapp.com
https://remote-worksio.web.app
http://localhost:3000
```

### 4. Add These Authorized Redirect URIs:

```
https://www.remote-works.io/__/auth/handler
https://remote-works.io/__/auth/handler
https://remote-worksio.firebaseapp.com/__/auth/handler
https://remote-worksio.web.app/__/auth/handler
http://localhost:3000/__/auth/handler
http://localhost/__/auth/handler
```

### 5. Click SAVE

**⏰ Wait 5-10 minutes** for changes to propagate before testing!

---

## ⚡ CRITICAL: Firebase Console Setup

### 1. Add Authorized Domains

**URL:** https://console.firebase.google.com/project/remote-worksio/authentication/settings

Add these domains:
```
www.remote-works.io
remote-works.io
localhost
```

### 2. Configure Hosting (If Using Custom Domain)

**URL:** https://console.firebase.google.com/project/remote-worksio/hosting/sites

1. Click "Add custom domain"
2. Enter: `www.remote-works.io`
3. Follow DNS setup instructions
4. Wait for SSL certificate (15 min - 24 hours)

---

## 📋 Verification Checklist

- [ ] Google OAuth: Added all 5 JavaScript origins
- [ ] Google OAuth: Added all 6 redirect URIs
- [ ] Google OAuth: Clicked SAVE and waited 10 minutes
- [ ] Firebase: Added `www.remote-works.io` to authorized domains
- [ ] Firebase: Added `remote-works.io` to authorized domains
- [ ] Firebase Hosting: Custom domain configured (if applicable)
- [ ] DNS: Records configured at domain registrar
- [ ] DNS: Verified propagation at https://dnschecker.org/
- [ ] SSL: Certificate provisioned (check Firebase Hosting)
- [ ] Local: Cleared `.next` folder: `rm -rf frontend/.next`
- [ ] Local: Rebuilt app: `npm run build`
- [ ] Local: Restarted dev server: `npm run dev`

---

## 🧪 Quick Test

After completing above steps:

```bash
# 1. Rebuild app
cd /home/user/rework/frontend
rm -rf .next
npm run build
npm run dev

# 2. Test in browser (after waiting 10 min from OAuth save)
# Open: http://localhost:3000/register
# Click "Continue with Google"
# Should redirect successfully
```

---

## 📝 What Was Updated

**File: `frontend/.env.local`**
```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.remote-works.io
NEXT_PUBLIC_SITE_URL=https://www.remote-works.io
NEXT_PUBLIC_USE_AUTH_REDIRECT=true
```

**File: `frontend/.env.example`**
```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.remote-works.io
NEXT_PUBLIC_SITE_URL=https://www.remote-works.io
NEXT_PUBLIC_USE_AUTH_REDIRECT=true
```

---

## ❗ Common Issues

### "redirect_uri_mismatch"
- **Fix:** Check error URL, add exact URI to Google OAuth settings, wait 10 min

### "Unauthorized domain"
- **Fix:** Add domain to Firebase → Authentication → Authorized domains

### Still shows "Redirect result: None"
- **Fix:** Wait 10 minutes after saving OAuth settings
- **Fix:** Clear browser cache completely
- **Fix:** Verify authDomain in console: `console.log(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)`

---

## 📖 Full Documentation

See `CUSTOM_DOMAIN_SETUP_VERIFICATION.md` for complete details and troubleshooting.

---

**Status:** ✅ Ready for Testing (after completing checklist above)

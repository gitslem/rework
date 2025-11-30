# 🚀 Deployment Instructions - Custom Domain OAuth

## ✅ What's Already Done

Your GitHub Actions workflow auto-deploys to Firebase when you merge to `main`.

I've already updated:
- ✅ `next.config.js` - Injects Firebase environment variables
- ✅ `.github/workflows/deploy-firebase.yml` - Updated workflow
- ✅ All OAuth redirect handling code
- ✅ `.env.local` - For local development

---

## 🎯 What You Need to Do (2 Required Steps)

Since your deployment is automated via GitHub Actions, you just need to:

### **STEP 1: Update GitHub Secrets** ⏰ **CRITICAL**

Your GitHub Actions workflow reads secrets during deployment. You need to update them:

**Go to:** https://github.com/YOUR_USERNAME/rework/settings/secrets/actions

**Update/Add These Secrets:**

1. Find `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` and **EDIT** it:
   - Current value: Probably `remote-worksio.firebaseapp.com`
   - **New value:** `www.remote-works.io`

2. Add new secret `NEXT_PUBLIC_USE_AUTH_REDIRECT`:
   - Click **"New repository secret"**
   - Name: `NEXT_PUBLIC_USE_AUTH_REDIRECT`
   - Value: `true`
   - Click **"Add secret"**

3. Verify these secrets exist (they should already):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
   - `NEXT_PUBLIC_SITE_URL` (should be `https://www.remote-works.io`)
   - `FIREBASE_SERVICE_ACCOUNT`

---

### **STEP 2: Configure Google OAuth** ⏰ **CRITICAL**

**Go to:** https://console.cloud.google.com/apis/credentials?project=remote-worksio

1. Find your **OAuth 2.0 Client ID** (Web client auto created by Google Service)
2. Click **EDIT** (pencil icon)

3. **Authorized redirect URIs** - Add these:
   ```
   https://www.remote-works.io/__/auth/handler
   https://remote-works.io/__/auth/handler
   https://remote-worksio.firebaseapp.com/__/auth/handler
   https://remote-worksio.web.app/__/auth/handler
   ```

4. **Authorized JavaScript origins** - Add these:
   ```
   https://www.remote-works.io
   https://remote-works.io
   https://remote-worksio.firebaseapp.com
   https://remote-worksio.web.app
   ```

5. Click **SAVE**
6. **⏰ WAIT 10 MINUTES** for Google to propagate

---

## 🚀 Deploy to Production

After completing Steps 1 and 2:

```bash
# Merge this branch to main to trigger auto-deployment
git checkout main
git merge claude/update-firebase-authdomain-01KQeGVBmAg1qYo5rX5EsGXu
git push
```

**What happens:**
1. GitHub Actions detects push to `main`
2. Workflow runs and builds your app with the GitHub secrets
3. Build includes `authDomain: www.remote-works.io`
4. Deploys to Firebase Hosting
5. Your custom domains automatically work

---

## ✅ Verify Deployment

After deployment completes (usually 2-5 minutes):

1. **Visit:** https://www.remote-works.io/register

2. **Open browser console** (F12)

3. **Click "Continue with Google"**

4. **Check console shows:**
   ```
   OAuth Config: {
     authDomain: "www.remote-works.io"  ← Custom domain
     envUseRedirect: true
   }
   ```

5. **Watch URL during OAuth:**
   - Should redirect to: `accounts.google.com`
   - Then to: `https://www.remote-works.io/__/auth/handler` ← Custom domain!
   - Then to: `https://www.remote-works.io/complete-profile`

6. **Complete the profile form**

7. **Should redirect to dashboard** ✅

---

## 🔧 Optional: Test Locally First

If you want to test before deploying to production:

```bash
cd /home/user/rework/frontend

# Run the automated fix script
./complete-fix.sh

# Start dev server
npm run dev

# Test at http://localhost:3000/register in incognito mode
```

---

## 🐛 Troubleshooting

### Deployment shows wrong authDomain

**Check GitHub Secrets:**
1. Go to repo Settings → Secrets → Actions
2. Verify `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `www.remote-works.io`
3. Verify `NEXT_PUBLIC_USE_AUTH_REDIRECT` = `true`
4. Re-run the deployment workflow

### "redirect_uri_mismatch" error

**This means Google OAuth isn't configured:**
1. Go to Google Cloud Console (Step 2 above)
2. Verify redirect URIs include: `https://www.remote-works.io/__/auth/handler`
3. Make sure you clicked SAVE
4. Wait 10 minutes and try again

### Users still stuck on register page

**Check browser console for errors:**

1. If console shows `Redirect result: None`:
   - Wait 10 more minutes (Google propagation)
   - Clear browser cache completely
   - Try in incognito mode

2. If console shows `authDomain: "remote-worksio.firebaseapp.com"`:
   - GitHub secret wasn't updated
   - Update the secret and re-deploy

---

## 📊 Deployment Workflow

Here's what happens when you merge:

```
1. Merge to main
   ↓
2. GitHub Actions triggers
   ↓
3. Checkout code
   ↓
4. Setup Node.js 20
   ↓
5. Install dependencies
   ↓
6. Build with GitHub secrets injected:
   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=www.remote-works.io
   - NEXT_PUBLIC_USE_AUTH_REDIRECT=true
   - All other Firebase vars
   ↓
7. next.config.js picks up env vars
   ↓
8. Static export includes custom domain
   ↓
9. Deploy to Firebase Hosting
   ↓
10. Live at www.remote-works.io ✅
```

---

## 📋 Quick Checklist

Before merging to main:

- [ ] Updated GitHub secret: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` → `www.remote-works.io`
- [ ] Added GitHub secret: `NEXT_PUBLIC_USE_AUTH_REDIRECT` → `true`
- [ ] Added Google OAuth redirect URI: `https://www.remote-works.io/__/auth/handler`
- [ ] Added Google OAuth JavaScript origin: `https://www.remote-works.io`
- [ ] Clicked SAVE in Google Cloud Console
- [ ] Waited 10 minutes

After checklist complete:
```bash
git checkout main
git merge claude/update-firebase-authdomain-01KQeGVBmAg1qYo5rX5EsGXu
git push
```

Then wait for deployment and test on live site!

---

**Last Updated:** 2025-11-30
**Status:** Ready to deploy
**Estimated deployment time:** 2-5 minutes after merge

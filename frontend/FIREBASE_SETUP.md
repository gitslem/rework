# Firebase Custom Domain Setup Instructions

## ⚠️ IMPORTANT: Complete These Steps

### Step 1: Update `.env.local` with Your Firebase Credentials

The file `/frontend/.env.local` has been created but contains placeholder values. You MUST update it with your actual Firebase project credentials.

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll down to **Your apps** section
5. Click on your web app (or create one if you haven't)
6. Copy the configuration values

**Update these values in `.env.local`:**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza... (your actual API key)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=remote-works.io
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 2: Configure Custom Domain in Firebase

#### A. Add Authorized Domain
1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Click **Add domain**
3. Add: `remote-works.io`
4. Click **Add**

#### B. Set Up Firebase Hosting (Required for Custom Domain Auth)

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting in your project
cd /home/user/rework/frontend
firebase init hosting

# When prompted:
# - Select your Firebase project
# - Set public directory: out (or build)
# - Configure as single-page app: Yes
# - Set up automatic builds: No
```

#### C. Connect Custom Domain in Firebase Console

1. Go to **Hosting** in Firebase Console
2. Click **Add custom domain**
3. Enter: `remote-works.io`
4. Follow the DNS verification steps:
   - Add the TXT record to your domain's DNS settings
   - Add the A records provided by Firebase

**Example DNS Records (values will be provided by Firebase):**
```
Type: A
Name: @
Value: 151.101.1.195, 151.101.65.195

Type: TXT
Name: @
Value: firebase-verification=xxxxxx
```

5. Wait for DNS propagation (can take 24-48 hours)
6. Firebase will automatically provision an SSL certificate

### Step 3: Update OAuth Provider Settings

#### For Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client ID** (it should be the one used by Firebase)
5. Click **Edit**
6. Add to **Authorized JavaScript origins:**
   ```
   https://remote-works.io
   ```
7. Add to **Authorized redirect URIs:**
   ```
   https://remote-works.io/__/auth/handler
   https://your-project.firebaseapp.com/__/auth/handler
   ```
   (Keep both - Firebase domain as fallback)
8. Click **Save**

### Step 4: Understanding Custom Domain Authentication

#### Important Technical Details:

**With `NEXT_PUBLIC_USE_AUTH_REDIRECT=true` (Current Setting):**
- ✅ Users will be redirected to `remote-works.io` for authentication
- ✅ The URL bar will show your custom domain throughout the process
- ✅ Better for branding and trust
- ⚠️ Slightly slower than popup (full page redirect)

**If you set `NEXT_PUBLIC_USE_AUTH_REDIRECT=false`:**
- Uses popup authentication
- Faster user experience
- ⚠️ The popup window will still show `firebaseapp.com` domain
- This is a Firebase limitation and cannot be changed with popups

**Recommendation:** Keep redirect mode enabled for custom domain branding.

### Step 5: Test Your Configuration

```bash
# Navigate to frontend directory
cd /home/user/rework/frontend

# Install dependencies (if not already done)
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Visit: http://localhost:3000/register
# Try signing up with Google
# You should be redirected through remote-works.io
```

### Step 6: Deploy to Production

Once DNS is configured and SSL certificate is active:

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Your site will be live at: https://remote-works.io
```

## Troubleshooting

### Issue: "Firebase is not configured"
**Solution:** Make sure you've updated `.env.local` with your actual Firebase credentials.

### Issue: "Unauthorized domain"
**Solution:** Add `remote-works.io` to Firebase Authentication → Authorized domains.

### Issue: OAuth redirect error
**Solution:**
1. Check Google Cloud Console OAuth settings
2. Ensure `https://remote-works.io/__/auth/handler` is in authorized redirect URIs
3. Wait a few minutes for changes to propagate

### Issue: DNS not resolving
**Solution:**
1. Verify DNS records are correct in your domain registrar
2. Use `dig remote-works.io` or online DNS checker
3. Wait up to 48 hours for full propagation

### Issue: SSL certificate error
**Solution:**
1. Firebase auto-provisions SSL - wait 15-30 minutes after DNS verification
2. Check Hosting → your domain → Status should be "Connected"

## Security Notes

- ✅ `.env.local` is already added to `.gitignore`
- ✅ Never commit Firebase credentials to git
- ✅ Keep your API keys secure
- ✅ Enable Firebase App Check for production
- ✅ Set up Firebase Security Rules for Firestore and Storage

## Support

If you need help:
1. Check Firebase Console → Authentication → Errors
2. Check browser console for error messages
3. Review Firebase Hosting logs
4. Contact Firebase Support if domain verification fails

---

**Status Checklist:**

- [ ] Updated `.env.local` with real Firebase credentials
- [ ] Added `remote-works.io` to Firebase Authorized Domains
- [ ] Initialized Firebase Hosting
- [ ] Added custom domain in Firebase Console
- [ ] Configured DNS records at domain registrar
- [ ] Waited for DNS propagation
- [ ] SSL certificate provisioned automatically
- [ ] Updated Google OAuth settings
- [ ] Tested authentication flow
- [ ] Deployed to production

**Last Updated:** 2025-11-29

# FIX: OAuth redirect_uri_mismatch Error

## 🚨 IMMEDIATE FIX - Get Authentication Working Now

### Step 1: Find Your Firebase Project Details

1. Go to: https://console.firebase.google.com/
2. Select your project
3. Note down:
   - **Project ID** (shown at the top, e.g., "remote-works-abc123")
   - **Web API Key** (Project Settings → General → Web API Key)

### Step 2: Update .env.local with Firebase Default Domain

Open `/home/user/rework/frontend/.env.local` and change this line:

**FROM:**
```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=remote-works.io
```

**TO:**
```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[YOUR-PROJECT-ID].firebaseapp.com
```

**Example:** If your project ID is `remote-works-abc123`, use:
```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=remote-works-abc123.firebaseapp.com
```

### Step 3: Also Update the Redirect Mode Setting

**Temporarily disable redirect mode** (we'll re-enable it later):

**FROM:**
```env
NEXT_PUBLIC_USE_AUTH_REDIRECT=true
```

**TO:**
```env
NEXT_PUBLIC_USE_AUTH_REDIRECT=false
```

### Step 4: Verify Google OAuth Configuration

1. Go to: https://console.cloud.google.com/
2. Select your Firebase project (same name as in Firebase Console)
3. Click on **Navigation Menu** (☰) → **APIs & Services** → **Credentials**
4. Find **OAuth 2.0 Client IDs** section
5. Click on the client ID that Firebase created (usually named "Web client (auto created by Google Service)")

**In "Authorized JavaScript origins", ensure these are added:**
```
http://localhost:3000
https://[YOUR-PROJECT-ID].firebaseapp.com
```

**In "Authorized redirect URIs", ensure these are added:**
```
http://localhost/__/auth/handler
http://localhost:3000/__/auth/handler
https://[YOUR-PROJECT-ID].firebaseapp.com/__/auth/handler
```

**Example:** If project ID is `remote-works-abc123`:
```
https://remote-works-abc123.firebaseapp.com/__/auth/handler
```

6. Click **SAVE**

### Step 5: Rebuild and Test

```bash
cd /home/user/rework/frontend

# Clear any cached builds
rm -rf .next

# Rebuild with new configuration
npm run build

# Start development server
npm run dev
```

Now visit: http://localhost:3000/register

Try Google sign-in again. It should work now! ✅

---

## 🎯 After Authentication Works - Setup Custom Domain (Optional)

Once authentication is working with the Firebase domain, follow these steps to use `remote-works.io`:

### Option A: Use Firebase Hosting with Custom Domain

#### 1. Set up Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting
cd /home/user/rework/frontend
firebase init hosting

# When prompted:
# - Public directory: out (or .next)
# - Single-page app: Yes
# - GitHub actions: No
```

#### 2. Add Custom Domain in Firebase Console

1. Go to Firebase Console → **Hosting**
2. Click **Add custom domain**
3. Enter: `remote-works.io`
4. Firebase will provide DNS records to add
5. Add the DNS records to your domain registrar:

**Example DNS records (Firebase will provide actual values):**
```
Type: A
Name: @
Value: 151.101.1.195

Type: A
Name: @
Value: 151.101.65.195

Type: TXT
Name: @
Value: [Firebase verification code]
```

6. Wait for DNS verification (can take up to 24-48 hours)
7. Firebase will automatically provision SSL certificate

#### 3. Update Google OAuth to Include Custom Domain

Go back to Google Cloud Console → Credentials → Your OAuth Client:

**Add to "Authorized JavaScript origins":**
```
https://remote-works.io
```

**Add to "Authorized redirect URIs":**
```
https://remote-works.io/__/auth/handler
```

Click **SAVE**

#### 4. Update .env.local for Custom Domain

**Only after DNS is verified and SSL is active**, update:

```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=remote-works.io
NEXT_PUBLIC_USE_AUTH_REDIRECT=true
```

Rebuild and deploy:
```bash
npm run build
firebase deploy --only hosting
```

### Option B: Keep Using Firebase Domain (Simpler)

If you don't want to set up custom domain for auth, just keep:

```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[YOUR-PROJECT-ID].firebaseapp.com
NEXT_PUBLIC_USE_AUTH_REDIRECT=false
```

Your main site can still use `remote-works.io`, but authentication will use the Firebase domain. This is perfectly fine and very common!

---

## 🔍 Common Errors and Solutions

### Error: "redirect_uri_mismatch"
**Cause:** The redirect URI doesn't match Google OAuth settings
**Fix:**
1. Check the error details - it shows which redirect URI was attempted
2. Add that exact URI to Google Cloud Console → Credentials
3. Wait 5 minutes for changes to propagate
4. Try again

### Error: "Popup blocked"
**Cause:** Browser blocked the popup
**Fix:** Set `NEXT_PUBLIC_USE_AUTH_REDIRECT=true` to use redirect instead

### Error: "Firebase not configured"
**Cause:** Missing or incorrect Firebase credentials in .env.local
**Fix:** Double-check all values match Firebase Console exactly

### Error: "Unauthorized domain"
**Cause:** Domain not in Firebase authorized domains
**Fix:**
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add your domain
3. Try again

---

## 📋 Complete .env.local Example

Here's what your `.env.local` should look like (with YOUR actual values):

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC_1234567890abcdefghijklmnopqrs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=remote-works-abc123.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=remote-works-abc123
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=remote-works-abc123.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC1234567

# Site URL
NEXT_PUBLIC_SITE_URL=https://remote-works.io

# Use popup (false) for faster auth, redirect (true) for custom domain
NEXT_PUBLIC_USE_AUTH_REDIRECT=false
```

---

## ✅ Verification Checklist

Before testing, ensure:

- [ ] Updated `.env.local` with correct Firebase project ID
- [ ] Used `[project-id].firebaseapp.com` as auth domain (not custom domain yet)
- [ ] Set `NEXT_PUBLIC_USE_AUTH_REDIRECT=false` for popup mode
- [ ] Verified Google OAuth settings include the Firebase redirect URI
- [ ] Deleted `.next` folder to clear cache
- [ ] Ran `npm run build` to rebuild with new config
- [ ] Waited 5 minutes after changing Google OAuth settings

---

## 🆘 Still Not Working?

If you're still getting errors, run this to check your configuration:

```bash
cd /home/user/rework/frontend

echo "=== Current .env.local Configuration ==="
grep "FIREBASE" .env.local | grep -v "^#"

echo ""
echo "=== Quick Test ==="
echo "1. Your auth domain should end with '.firebaseapp.com'"
echo "2. Make sure this matches your Firebase Project ID"
echo "3. Check Google Cloud Console for matching redirect URI"
```

Then share the output and any error messages.

---

**Last Updated:** 2025-11-29

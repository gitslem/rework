# Google OAuth Client Configuration Guide

## 🎯 Which Client ID to Use?

### ✅ USE THIS ONE:
**"Web client (auto created by Google Service)"**
- This is automatically created by Firebase
- Client ID ends with `.apps.googleusercontent.com`
- This is what your Firebase app uses
- **You need to ADD redirect URIs to this client**

### ❌ DON'T USE THESE:
- iOS client - for iOS apps only
- Android client - for Android apps only
- Any other custom clients (unless you created them for a specific purpose)

---

## 📝 How to Configure (Step by Step)

### 1. Open Google Cloud Console
```
https://console.cloud.google.com/
```

### 2. Select Your Firebase Project
- Make sure you're in the SAME project as your Firebase
- Check the project name at the top

### 3. Navigate to Credentials
```
☰ Menu → APIs & Services → Credentials
```

### 4. Find and Click the Web Client
- Look for: "Web client (auto created by Google Service)"
- Click the **pencil icon ✏️** or the name to edit

### 5. Add Required Settings

You'll see a form with several sections:

#### A. Authorized JavaScript origins
Add these URLs (click "+ ADD URI"):
```
http://localhost:3000
https://YOUR-PROJECT-ID.firebaseapp.com
```

Replace `YOUR-PROJECT-ID` with your actual Firebase project ID.

**Example:**
```
http://localhost:3000
https://remote-works-abc123.firebaseapp.com
```

#### B. Authorized redirect URIs
Add these URLs (click "+ ADD URI"):
```
http://localhost/__/auth/handler
http://localhost:3000/__/auth/handler
https://YOUR-PROJECT-ID.firebaseapp.com/__/auth/handler
```

Replace `YOUR-PROJECT-ID` with your actual Firebase project ID.

**Example:**
```
http://localhost/__/auth/handler
http://localhost:3000/__/auth/handler
https://remote-works-abc123.firebaseapp.com/__/auth/handler
```

⚠️ **IMPORTANT:** The `/__/auth/handler` path is required - don't change it!

### 6. Save
- Click **SAVE** button at the bottom
- Wait 2-5 minutes for changes to propagate

---

## 🔐 About Client Secret

### Do You Need It?
**NO** - For Firebase client-side authentication, you **don't need** to configure or use the client secret.

### Why Is It Shown?
- The secret is for **server-side** OAuth flows
- Firebase handles authentication **client-side** in the browser
- The secret is automatically used by Firebase behind the scenes
- **You never put the secret in your frontend code**

### What to Do With It?
- ✅ Keep it secret (don't share it)
- ✅ Don't put it in `.env.local` or any frontend code
- ✅ Ignore it for Firebase web authentication

---

## 📋 Configuration Checklist

Before testing, make sure:

- [ ] You edited the **Web client** (not iOS or Android)
- [ ] Client ID matches what's shown in Firebase Console
- [ ] Added `http://localhost:3000` to JavaScript origins
- [ ] Added `https://YOUR-PROJECT-ID.firebaseapp.com` to JavaScript origins
- [ ] Added `http://localhost:3000/__/auth/handler` to redirect URIs
- [ ] Added `https://YOUR-PROJECT-ID.firebaseapp.com/__/auth/handler` to redirect URIs
- [ ] Clicked **SAVE**
- [ ] Waited 5 minutes for changes to take effect

---

## 🔍 Visual Reference

### What the Configuration Should Look Like:

```
╔════════════════════════════════════════════════════════════════╗
║  Edit OAuth client                                             ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Name: Web client (auto created by Google Service)            ║
║                                                                ║
║  Client ID: 123456789-abc123.apps.googleusercontent.com       ║
║                                                                ║
║  Client secret: GOCSPX-abc123def456 (don't share this)        ║
║                                                                ║
║  ─────────────────────────────────────────────────────────── ║
║                                                                ║
║  Authorized JavaScript origins                                 ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ • http://localhost:3000                                   │ ║
║  │ • https://remote-works-abc123.firebaseapp.com            │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  Authorized redirect URIs                                      ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ • http://localhost/__/auth/handler                        │ ║
║  │ • http://localhost:3000/__/auth/handler                  │ ║
║  │ • https://remote-works-abc123.firebaseapp.com/__/auth... │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  [ SAVE ]  [ CANCEL ]                                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🚫 Common Mistakes

### ❌ Editing the Wrong Client
- **Wrong:** Editing iOS or Android client
- **Right:** Edit "Web client (auto created by Google Service)"

### ❌ Forgetting the `/__/auth/handler` Path
- **Wrong:** `https://myproject.firebaseapp.com`
- **Right:** `https://myproject.firebaseapp.com/__/auth/handler`

### ❌ Using Custom Domain Before Setup
- **Wrong:** Adding `https://remote-works.io/__/auth/handler` before DNS is configured
- **Right:** First use `https://project-id.firebaseapp.com/__/auth/handler`, then add custom domain later

### ❌ Not Waiting for Changes to Propagate
- **Wrong:** Testing immediately after saving
- **Right:** Wait 2-5 minutes, then test

---

## 🔄 After Configuration

### Test Your Setup:

1. **Update .env.local** with Firebase default domain:
   ```env
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR-PROJECT-ID.firebaseapp.com
   NEXT_PUBLIC_USE_AUTH_REDIRECT=false
   ```

2. **Rebuild your app:**
   ```bash
   cd /home/user/rework/frontend
   rm -rf .next
   npm run build
   npm run dev
   ```

3. **Test authentication:**
   - Visit: http://localhost:3000/register
   - Click "Sign in with Google"
   - Should work without redirect_uri_mismatch error ✅

---

## 🆘 Still Getting Errors?

### Error: redirect_uri_mismatch
**Check:**
- Is the redirect URI exactly right? (including `/__/auth/handler`)
- Did you save the changes?
- Did you wait 5 minutes?
- Are you editing the Web client (not iOS/Android)?

### Error: popup_closed_by_user
**Solution:**
- This is normal - user just closed the popup
- Try again

### Error: Unauthorized domain
**Solution:**
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add your domain there too

---

**Last Updated:** 2025-11-29

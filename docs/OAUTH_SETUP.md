# OAuth Setup Guide

Complete guide for setting up GitHub, Hugging Face, and Google OAuth for the Rework platform.

## Overview

The platform supports three OAuth providers:
- **Google OAuth** - For login/registration
- **GitHub OAuth** - For login and proof-of-build verification
- **Hugging Face OAuth** - For login and ML model verification

---

## 1. GitHub OAuth Setup

### Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `Rework - [Environment]` (e.g., "Rework - Production")
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `https://yourdomain.com/github/callback`
   - For local development: `http://localhost:3000/github/callback`

4. Click **"Register application"**
5. Copy the **Client ID**
6. Generate a new **Client Secret** and copy it immediately

### Configure Environment Variables

**Backend (.env):**
```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret  # For webhooks
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```

### Testing GitHub OAuth

1. Navigate to `/proofs` page
2. Click **"Connect GitHub"** button
3. You'll be redirected to GitHub for authorization
4. After approval, you'll be redirected back to `/github/callback`
5. Your GitHub account should now be connected

**Callback URL Format:**
```
https://yourdomain.com/github/callback?code=AUTHORIZATION_CODE
```

---

## 2. Hugging Face OAuth Setup

### Create Hugging Face OAuth App

1. Go to [Hugging Face Applications](https://huggingface.co/settings/applications)
2. Click **"Create new application"**
3. Fill in the details:
   - **Name**: `Rework Platform`
   - **Homepage URL**: `https://yourdomain.com`
   - **Redirect URI**: `https://yourdomain.com/huggingface/callback`
   - For local development: `http://localhost:3000/huggingface/callback`
   - **Scopes**: Select `profile` and `email`

4. Click **"Create application"**
5. Copy the **Client ID**
6. Copy the **Client Secret**

### Configure Environment Variables

**Backend (.env):**
```bash
HUGGINGFACE_CLIENT_ID=your_hf_client_id
HUGGINGFACE_CLIENT_SECRET=your_hf_client_secret
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_HUGGINGFACE_CLIENT_ID=your_hf_client_id
```

### Testing Hugging Face OAuth

1. Navigate to `/proofs` page
2. Click **"Connect Hugging Face"** button (if implemented)
3. You'll be redirected to Hugging Face for authorization
4. After approval, you'll be redirected back to `/huggingface/callback`
5. Your Hugging Face account should now be connected

---

## 3. Google OAuth Setup

### Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
5. Configure consent screen if prompted
6. Select **"Web application"**
7. Fill in details:
   - **Name**: `Rework Platform`
   - **Authorized JavaScript origins**:
     - `https://yourdomain.com`
     - `http://localhost:3000` (for dev)
   - **Authorized redirect URIs**:
     - `https://yourdomain.com/auth/google/callback`
     - `http://localhost:3000/auth/google/callback` (for dev)

8. Click **"Create"**
9. Copy the **Client ID** and **Client Secret**

### Configure Environment Variables

**Backend (.env):**
```bash
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 4. Complete Environment Setup

### Backend `.env` Template

```bash
# App
APP_NAME="Rework API"
DATABASE_URL=your_database_url

# Security
SECRET_KEY=your-secret-key-use-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","https://yourdomain.com"]

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Hugging Face OAuth
HUGGINGFACE_CLIENT_ID=your_hf_client_id
HUGGINGFACE_CLIENT_SECRET=your_hf_client_secret

# OpenAI (optional, for AI summaries)
OPENAI_API_KEY=your_openai_key

# Proof-of-Build
PROOF_SIGNATURE_KEY=proof-signature-key-change-in-production

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Environment
ENVIRONMENT=production
```

### Frontend `.env.local` Template

```bash
# API URL
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1

# OAuth Client IDs (Public)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_HUGGINGFACE_CLIENT_ID=your_hf_client_id
```

---

## 5. OAuth Flow Diagrams

### GitHub OAuth Flow

```
User clicks "Connect GitHub"
    ↓
Frontend redirects to: github.com/login/oauth/authorize
    ↓
User authorizes on GitHub
    ↓
GitHub redirects to: yourdomain.com/github/callback?code=XXX
    ↓
Frontend sends code to: POST /auth/github or /auth/github/connect
    ↓
Backend exchanges code for access token with GitHub
    ↓
Backend stores github_id and access_token in database
    ↓
User is connected/logged in
```

### Hugging Face OAuth Flow

```
User clicks "Connect Hugging Face"
    ↓
Frontend redirects to: huggingface.co/oauth/authorize
    ↓
User authorizes on Hugging Face
    ↓
HF redirects to: yourdomain.com/huggingface/callback?code=XXX
    ↓
Frontend sends code to: POST /auth/huggingface or /auth/huggingface/connect
    ↓
Backend exchanges code for access token with HF
    ↓
Backend stores huggingface_id and access_token in database
    ↓
User is connected/logged in
```

---

## 6. Security Best Practices

### Client Secrets

**Never expose client secrets in frontend code:**
- ✅ Store in backend `.env` file
- ✅ Use environment variables
- ❌ Don't commit to version control
- ❌ Don't expose in frontend JavaScript

### Callback URLs

**Always use HTTPS in production:**
- ✅ `https://yourdomain.com/github/callback`
- ❌ `http://yourdomain.com/github/callback`

### State Parameters

For enhanced security, consider adding state parameters:
```typescript
const state = generateRandomString();
sessionStorage.setItem('oauth_state', state);
window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&state=${state}`;
```

Then verify in callback:
```typescript
const { code, state } = router.query;
const savedState = sessionStorage.getItem('oauth_state');
if (state !== savedState) {
  throw new Error('Invalid state parameter');
}
```

---

## 7. Troubleshooting

### GitHub: "client_id=undefined"

**Problem:** Frontend shows `client_id=undefined` in OAuth URL

**Solution:**
1. Ensure `NEXT_PUBLIC_GITHUB_CLIENT_ID` is set in `.env.local`
2. Restart Next.js development server after adding env vars
3. Check that env var starts with `NEXT_PUBLIC_` (required for Next.js)

### Callback 404 Error

**Problem:** OAuth callback returns 404 page not found

**Solution:**
1. Ensure callback page exists at `frontend/src/pages/github/callback.tsx`
2. Check that OAuth app's callback URL matches exactly
3. Verify Next.js is serving the page correctly

### "Redirect URI mismatch"

**Problem:** OAuth provider shows redirect URI mismatch error

**Solution:**
1. Go to OAuth app settings
2. Add the exact callback URL: `https://yourdomain.com/github/callback`
3. For local development, add: `http://localhost:3000/github/callback`
4. Save changes and try again

### "Account already connected"

**Problem:** Error when trying to connect OAuth account

**Solution:**
- This GitHub/HF account is already linked to another user
- Use a different account or disconnect from the other user first

---

## 8. Testing Checklist

### GitHub OAuth Testing

- [ ] Click "Connect GitHub" button
- [ ] Redirected to GitHub authorization page
- [ ] GitHub shows correct app name and permissions
- [ ] After authorization, redirected to callback page
- [ ] Success message displayed
- [ ] Redirected to proofs page
- [ ] GitHub username appears in profile
- [ ] Can create GitHub commit proofs

### Hugging Face OAuth Testing

- [ ] Click "Connect Hugging Face" button
- [ ] Redirected to Hugging Face authorization page
- [ ] HF shows correct app name and permissions
- [ ] After authorization, redirected to callback page
- [ ] Success message displayed
- [ ] Redirected to proofs page
- [ ] HF username appears in profile
- [ ] Can create HF model proofs

### Google OAuth Testing

- [ ] Click "Sign in with Google" button
- [ ] Redirected to Google account selection
- [ ] Select account
- [ ] After authorization, redirected back
- [ ] Logged in successfully
- [ ] User created/logged in

---

## 9. Production Deployment

### Environment Variables

**On Render.com/Vercel/Netlify:**

1. Go to your app settings
2. Add environment variables:
   - Backend: Add all `.env` variables
   - Frontend: Add all `NEXT_PUBLIC_*` variables
3. Redeploy both services

### OAuth App Callback URLs

Update all OAuth apps with production URLs:

**GitHub:**
- Callback: `https://yourproductiondomain.com/github/callback`

**Hugging Face:**
- Redirect URI: `https://yourproductiondomain.com/huggingface/callback`

**Google:**
- Authorized redirect URI: `https://yourproductiondomain.com/auth/google/callback`

### SSL/HTTPS

Ensure your domain has valid SSL certificate:
- Most hosting providers (Render, Vercel, Netlify) provide free SSL
- OAuth providers require HTTPS for production

---

## 10. Support

If you encounter issues:

1. Check browser console for errors
2. Check backend logs for API errors
3. Verify all environment variables are set correctly
4. Ensure OAuth app callback URLs match exactly
5. Test with a fresh OAuth authorization (revoke and reconnect)

For detailed API documentation, see:
- Backend: `http://localhost:8000/docs` (Swagger UI)
- Proof of Build: `/docs/PROOF_OF_BUILD_IMPLEMENTATION.md`
- GitHub Webhooks: `/docs/WEBHOOK_SETUP.md`

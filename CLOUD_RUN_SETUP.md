# Google Cloud Run Deployment Setup Guide

This guide will help you set up automatic deployment of your backend to Google Cloud Run alongside your existing Firebase Hosting deployment.

## Overview

Your application now uses a two-tier deployment strategy:
- **Frontend**: Deployed to Firebase Hosting (via GitHub Actions)
- **Backend**: Deployed to Google Cloud Run (via GitHub Actions)

The backend URL is automatically injected into the frontend build during deployment.

## Prerequisites

1. Google Cloud Project (same as your Firebase project)
2. GitHub repository with appropriate secrets configured
3. MailerSend account with verified domain

## Step 1: Enable Required Google Cloud APIs

Run these commands in Google Cloud Console or Cloud Shell:

```bash
# Set your project ID
export PROJECT_ID="remote-worksio"

# Enable required APIs
gcloud services enable run.googleapis.com --project=$PROJECT_ID
gcloud services enable containerregistry.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID
```

Or enable them via the Cloud Console:
- https://console.cloud.google.com/apis/library/run.googleapis.com
- https://console.cloud.google.com/apis/library/containerregistry.googleapis.com
- https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com

## Step 2: Configure GitHub Secrets

You need to add the following secrets to your GitHub repository. Go to:
**Settings → Secrets and variables → Actions → New repository secret**

### Required Secrets

#### 1. MAILERSEND_API_KEY
Your MailerSend API key for sending email notifications.
- Get from: https://app.mailersend.com/api-tokens
- Format: `mlsn.xxxxxxxxxxxxx`

#### 2. DATABASE_URL
Your database connection string.

For SQLite (testing/development):
```
sqlite:///./remoteworks.db
```

For PostgreSQL (production recommended):
```
postgresql://username:password@host:port/database
```

For Google Cloud SQL:
```
postgresql://username:password@/database?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
```

#### 3. SECRET_KEY
A secure random key for JWT token signing.

Generate with:
```bash
openssl rand -hex 32
```

#### 4. BACKEND_CORS_ORIGINS
JSON array of allowed CORS origins (should include your frontend URL).

Format:
```json
["https://www.remote-works.io","https://remote-works.io"]
```

#### 5. Existing Secrets
Make sure these are already set (they should be from your Firebase setup):
- `FIREBASE_SERVICE_ACCOUNT` - Your Firebase service account JSON
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `NEXT_PUBLIC_SITE_URL` - Your production site URL
- All other `NEXT_PUBLIC_FIREBASE_*` secrets

## Step 3: Grant Permissions to Service Account

Your Firebase service account needs additional permissions for Cloud Run deployment.

1. Go to Google Cloud Console: https://console.cloud.google.com/iam-admin/iam
2. Find the service account used in `FIREBASE_SERVICE_ACCOUNT`
3. Click "Edit principal" (pencil icon)
4. Add these roles:
   - **Cloud Run Admin** (`roles/run.admin`)
   - **Service Account User** (`roles/iam.serviceAccountUser`)
   - **Storage Admin** (`roles/storage.admin`)
   - **Container Registry Service Agent** (`roles/containerregistry.ServiceAgent`)

Or via command line:
```bash
# Get the service account email from your FIREBASE_SERVICE_ACCOUNT secret
SERVICE_ACCOUNT="firebase-adminsdk-xxxxx@remote-worksio.iam.gserviceaccount.com"

# Grant roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/containerregistry.ServiceAgent"
```

## Step 4: Deploy

Once secrets are configured, push to the main branch:

```bash
git add .
git commit -m "Add Google Cloud Run deployment"
git push origin main
```

GitHub Actions will:
1. ✅ Build and deploy backend to Cloud Run
2. ✅ Get the backend URL
3. ✅ Build frontend with the backend URL
4. ✅ Deploy frontend to Firebase Hosting

## Step 5: Verify Deployment

### Check Backend Deployment

1. Visit Cloud Run console: https://console.cloud.google.com/run
2. You should see a service named `rework-backend`
3. Click on it to see the service URL (e.g., `https://rework-backend-xxxxx-uc.a.run.app`)

### Test Backend Health

```bash
# Replace with your actual Cloud Run URL
BACKEND_URL="https://rework-backend-xxxxx-uc.a.run.app"

# Test health endpoint
curl $BACKEND_URL/health

# Should return:
# {
#   "status": "healthy",
#   "database": "connected",
#   "version": "1.0.0",
#   "environment": "production"
# }
```

### Test Email Notifications

1. Log in to your frontend as an agent
2. Create a new project for a candidate
3. Check the browser console for email notification logs
4. Candidate should receive an email notification

## Step 6: Monitor Logs

### Backend Logs (Cloud Run)

View logs in Cloud Console:
```bash
# Via CLI
gcloud run services logs read rework-backend --region=us-central1 --limit=50

# Via Console
# https://console.cloud.google.com/run/detail/us-central1/rework-backend/logs
```

### Frontend Logs (Firebase)

```bash
firebase hosting:channel:deploy preview
```

## Local Development

For local development, you still need to run the backend locally:

### 1. Start Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Configuration

Create `frontend/.env.local`:
```bash
cp frontend/.env.local.template frontend/.env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Troubleshooting

### 1. "Permission denied" during deployment

**Issue**: Service account lacks required permissions.

**Solution**: Re-check Step 3 and ensure all roles are granted.

### 2. "Failed to build Docker image"

**Issue**: Docker build failing in GitHub Actions.

**Solution**:
- Check `backend/Dockerfile` is present
- Verify `backend/requirements.txt` is valid
- Check GitHub Actions logs for specific error

### 3. "CORS error" in frontend

**Issue**: Backend not allowing requests from frontend domain.

**Solution**: Update `BACKEND_CORS_ORIGINS` secret to include your frontend URL:
```json
["https://www.remote-works.io","https://remote-works.io"]
```

### 4. "Database connection failed"

**Issue**: Backend can't connect to database.

**Solution**:
- For SQLite: This is expected in Cloud Run (use PostgreSQL for production)
- For PostgreSQL: Verify `DATABASE_URL` secret is correct
- For Cloud SQL: Ensure Cloud SQL Admin API is enabled and connection configured

### 5. Email notifications not working

**Issue**: Emails not being sent.

**Solution**:
- Verify `MAILERSEND_API_KEY` secret is set correctly
- Check backend logs for email sending errors
- Verify domain is verified in MailerSend
- Test endpoint: `curl -X POST $BACKEND_URL/api/v1/candidate-projects/send-creation-email`

### 6. Backend URL not injected into frontend

**Issue**: Frontend using localhost URL in production.

**Solution**:
- Check GitHub Actions logs for backend deployment output
- Verify `deploy_backend` job completed successfully
- Ensure `deploy_frontend` job has `needs: deploy_backend`

## Cost Optimization

Cloud Run offers generous free tier:
- 2 million requests per month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds of compute time

Tips to minimize costs:
1. ✅ Use `--allow-unauthenticated` only if needed (we need it for email webhooks)
2. ✅ Set minimum instances to 0 (default) - scales to zero when not in use
3. ✅ Monitor usage in Cloud Console: https://console.cloud.google.com/run

## Production Database Setup (Recommended)

For production, use Cloud SQL PostgreSQL instead of SQLite:

### Create Cloud SQL Instance

```bash
# Create instance
gcloud sql instances create rework-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --project=$PROJECT_ID

# Create database
gcloud sql databases create remoteworks \
  --instance=rework-db

# Create user
gcloud sql users create rework_user \
  --instance=rework-db \
  --password=SECURE_PASSWORD_HERE
```

### Update Secrets

Update `DATABASE_URL` in GitHub Secrets:
```
postgresql://rework_user:SECURE_PASSWORD_HERE@/remoteworks?host=/cloudsql/remote-worksio:us-central1:rework-db
```

### Update Cloud Run Deployment

Add to workflow (in `deploy_backend` job):
```yaml
--add-cloudsql-instances remote-worksio:us-central1:rework-db
```

## Support

If you encounter issues:
1. Check GitHub Actions logs: https://github.com/your-org/rework/actions
2. Check Cloud Run logs: https://console.cloud.google.com/run
3. Review this documentation
4. Check `EMAIL_TROUBLESHOOTING_GUIDE.md` for email-specific issues

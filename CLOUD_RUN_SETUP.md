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
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID
gcloud services enable artifactregistry.googleapis.com --project=$PROJECT_ID
```

Or enable them via the Cloud Console:
- https://console.cloud.google.com/apis/library/run.googleapis.com
- https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com
- https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com

## Step 2: Set Up Google Cloud Secrets

The deployment uses Google Secret Manager to securely store sensitive configuration. You have two options:

### Option A: Use the Setup Script (Recommended)

```bash
./setup-gcp-secrets.sh
```

This interactive script will:
1. Enable Secret Manager API
2. Create all required secrets
3. Grant access to the Cloud Run service account

### Option B: Manual Setup

Create these secrets in Google Secret Manager:

```bash
# Set your project ID
export PROJECT_ID="your-project-id"

# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID

# Create secrets (you'll be prompted for values)
echo -n "your-database-url" | gcloud secrets create DATABASE_URL \
  --data-file=- --replication-policy="automatic" --project=$PROJECT_ID

echo -n "$(openssl rand -hex 32)" | gcloud secrets create SECRET_KEY \
  --data-file=- --replication-policy="automatic" --project=$PROJECT_ID

echo -n "your-mailersend-api-key" | gcloud secrets create MAILERSEND_API_KEY \
  --data-file=- --replication-policy="automatic" --project=$PROJECT_ID

echo -n '["https://www.remote-works.io","https://remote-works.io"]' | gcloud secrets create BACKEND_CORS_ORIGINS \
  --data-file=- --replication-policy="automatic" --project=$PROJECT_ID
```

### Required Secret Values

1. **DATABASE_URL** - Database connection string
   - SQLite (testing): `sqlite:///./remoteworks.db`
   - PostgreSQL: `postgresql://user:pass@host:port/db`
   - Cloud SQL: `postgresql://user:pass@/db?host=/cloudsql/PROJECT:REGION:INSTANCE`

2. **SECRET_KEY** - JWT token signing key
   - Generate with: `openssl rand -hex 32`

3. **MAILERSEND_API_KEY** - MailerSend API key
   - Get from: https://app.mailersend.com/api-tokens
   - Format: `mlsn.xxxxxxxxxxxxx`

4. **BACKEND_CORS_ORIGINS** - Allowed CORS origins (JSON array)
   - Example: `["https://www.remote-works.io","https://remote-works.io"]`

## Step 3: Configure GitHub Secrets

Add these secrets to your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

### Required GitHub Secrets

1. **WORKLOAD_IDENTITY_PROVIDER**
   - Your Workload Identity Provider resource name
   - Format: `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID`
   - See setup guide: https://github.com/google-github-actions/auth#setup

2. **GCP_SERVICE_ACCOUNT**
   - Service account email for deployment
   - Format: `github-actions@PROJECT_ID.iam.gserviceaccount.com`
   - **NOT** the firebase-adminsdk account

3. **GCP_PROJECT_ID**
   - Your Google Cloud project ID

4. **NEXT_PUBLIC_SITE_URL**
   - Your production frontend URL
   - Example: `https://www.remote-works.io`

5. **FROM_EMAIL**
   - Email address for notifications
   - Example: `noreply@remote-works.io`

### Existing Secrets (from Firebase setup)
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON (used for Firebase Hosting only)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- All other `NEXT_PUBLIC_FIREBASE_*` secrets

## Step 4: Grant Permissions to Service Account

The service account specified in GCP_SERVICE_ACCOUNT needs proper IAM permissions.

1. Go to Google Cloud Console: https://console.cloud.google.com/iam-admin/iam
2. Find the service account used in `FIREBASE_SERVICE_ACCOUNT`
3. Click "Edit principal" (pencil icon)
4. Add these roles:
   - **Cloud Run Admin** (`roles/run.admin`)
   - **Cloud Build Editor** (`roles/cloudbuild.builds.editor`)
   - **Artifact Registry Writer** (`roles/artifactregistry.writer`)
   - **Service Account User** (`roles/iam.serviceAccountUser`)

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
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/iam.serviceAccountUser"
```

## Step 5: Grant Secret Access

The Cloud Run service account needs access to read secrets from Secret Manager:

```bash
# Get your service account email
SERVICE_ACCOUNT="github-actions@PROJECT_ID.iam.gserviceaccount.com"

# Grant secret accessor role for each secret
for secret in DATABASE_URL SECRET_KEY MAILERSEND_API_KEY BACKEND_CORS_ORIGINS; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    --project=$PROJECT_ID
done
```

Or use the setup script which does this automatically.

## Step 6: Deploy

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

## Step 7: Verify Deployment

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

## Step 8: Monitor Logs

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

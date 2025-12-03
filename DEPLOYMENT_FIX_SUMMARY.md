# Cloud Run Deployment Fix Summary

## Problems Identified

### 1. ❌ Wrong Service Account Being Used
**Issue**: Deployment was running as `firebase-adminsdk-fbsvc@***.iam.gserviceaccount.com`
- This is the Firebase Admin SDK service account
- It lacks permissions for Artifact Registry, Cloud Build, and Cloud Run
- Caused: "Permission denied" errors during Docker build and deployment

**Solution**:
- Create a dedicated deployment service account for GitHub Actions
- Configure Workload Identity Federation
- Add GitHub secrets: `WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`

### 1.1. ❌ Missing ActAs Permission (CRITICAL)
**Issue**: Service account can't "act as" the Cloud Run runtime service account
```
ERROR: Permission 'iam.serviceaccounts.actAs' denied on service account
706683337174-compute@developer.gserviceaccount.com
```

**Why**: Cloud Run needs to run containers as the default compute service account. The GitHub Actions service account must have permission to "impersonate" or "act as" this runtime account.

**Solution**: Grant `roles/iam.serviceAccountUser` on the compute service account itself:
```bash
gcloud iam service-accounts add-iam-policy-binding \
  PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### 1.2. ❌ Missing Artifact Registry Repository
**Issue**: Repository doesn't exist and service account can't create it
```
ERROR: PERMISSION_DENIED: Permission 'artifactregistry.repositories.create' denied
```

**Solution**: Pre-create the repository:
```bash
gcloud artifacts repositories create cloud-run-source-deploy \
  --repository-format=docker \
  --location=us-central1 \
  --project=PROJECT_ID
```

### 2. ❌ Deploying from Wrong Directory
**Issue**: Workflow was deploying from root directory (`.`) but Dockerfile is in `backend/`
```yaml
# OLD (WRONG)
--source .

# NEW (FIXED)
--source ./backend
```

**Why it failed**:
- Cloud Build couldn't find the Dockerfile
- Build failed before deployment even started

### 3. ❌ Missing Environment Variables
**Issue**: Cloud Run service didn't have required environment variables
- No DATABASE_URL
- No SECRET_KEY
- No MAILERSEND_API_KEY
- No CORS origins

**Solution**: Added environment variable and secret configuration to workflow

### 4. ❌ Hardcoded API Key in Source Code
**Issue**: MailerSend API key was hardcoded in `backend/app/core/config.py`
```python
MAILERSEND_API_KEY: str = "mlsn.dd1a69c9738d7806d730cb8d4e7be44555d60044092fdb9906e0dd4aad6a5998"
```

**Security Risk**: API key exposed in git history and source code

**Solution**: Removed hardcoded key, now loaded from environment/secrets only

## Changes Made

### 1. Updated GitHub Actions Workflow (`.github/workflows/deploy.yml`)

**Changes**:
- ✅ Separated build and deploy steps for better control
- ✅ Build Docker image first with `gcloud builds submit`
- ✅ Deploy pre-built image to Cloud Run
- ✅ Added environment variables via `--set-env-vars`
- ✅ Added secret references via `--set-secrets`
- ✅ Added resource limits (512Mi memory, 1 CPU)
- ✅ Added scaling configuration (0-10 instances)
- ✅ Set platform to `managed`
- ✅ Enabled public access with `--allow-unauthenticated`

```yaml
- name: Build and push Docker image
  run: |
    cd backend
    gcloud builds submit \
      --tag us-central1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/cloud-run-source-deploy/rework-backend:${{ github.sha }} \
      --project ${{ secrets.GCP_PROJECT_ID }} \
      --quiet

- name: Deploy to Cloud Run
  run: |
    gcloud run deploy rework-backend \
      --image us-central1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/cloud-run-source-deploy/rework-backend:${{ github.sha }} \
      --region us-central1 \
      --project ${{ secrets.GCP_PROJECT_ID }} \
      --platform managed \
      --allow-unauthenticated \
      --set-env-vars="ENVIRONMENT=production,API_V1_STR=/api/v1,FRONTEND_URL=${{ secrets.NEXT_PUBLIC_SITE_URL }},FROM_EMAIL=${{ secrets.FROM_EMAIL }},FROM_NAME=Remote-Works" \
      --set-secrets="DATABASE_URL=DATABASE_URL:latest,SECRET_KEY=SECRET_KEY:latest,MAILERSEND_API_KEY=MAILERSEND_API_KEY:latest,BACKEND_CORS_ORIGINS=BACKEND_CORS_ORIGINS:latest" \
      --memory 512Mi \
      --cpu 1 \
      --min-instances 0 \
      --max-instances 10 \
      --timeout 300 \
      --quiet
```

### 2. Fixed Security Issue (`backend/app/core/config.py`)

**Before**:
```python
MAILERSEND_API_KEY: str = "mlsn.dd1a69c9738d7806d730cb8d4e7be44555d60044092fdb9906e0dd4aad6a5998"
```

**After**:
```python
MAILERSEND_API_KEY: str = ""  # MUST be set via environment variable or secret
```

### 3. Created Setup Scripts

#### `setup-gcp-secrets.sh`
Interactive script to:
- Enable Secret Manager API
- Create all required secrets in Google Secret Manager
- Grant service account access to secrets

Usage:
```bash
./setup-gcp-secrets.sh
```

#### `setup-service-account-permissions.sh` (NEW - CRITICAL)
Comprehensive script to fix ALL permission issues:
- Grant all required project-level IAM roles
- Grant actAs permission on Cloud Run runtime service account
- Create Artifact Registry repository
- Enable all required APIs
- Grant access to secrets

Usage:
```bash
./setup-service-account-permissions.sh
```

**⚠️ IMPORTANT**: Run this script FIRST to fix permission issues!

### 4. Updated Documentation

#### `CLOUD_RUN_SETUP.md`
Enhanced documentation with:
- Clear distinction between Firebase Admin SDK account and deployment account
- Step-by-step secret setup instructions
- GitHub secrets configuration
- Service account IAM permissions
- Troubleshooting guide

#### `PERMISSION_FIX_GUIDE.md` (NEW)
Comprehensive guide for fixing permission issues:
- Detailed explanation of actAs permission
- Step-by-step manual setup instructions
- Verification steps
- Common issues and solutions
- Security best practices

## Required Configuration

### GitHub Secrets (Must be configured)

| Secret Name | Description | Example |
|------------|-------------|---------|
| `WORKLOAD_IDENTITY_PROVIDER` | Workload Identity Provider resource | `projects/123/locations/global/...` |
| `GCP_SERVICE_ACCOUNT` | Deployment service account email | `github-actions@project.iam.gserviceaccount.com` |
| `GCP_PROJECT_ID` | Google Cloud project ID | `remote-worksio` |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL | `https://www.remote-works.io` |
| `FROM_EMAIL` | Email sender address | `noreply@remote-works.io` |

### Google Cloud Secrets (Must be created in Secret Manager)

| Secret Name | Description | Example |
|------------|-------------|---------|
| `DATABASE_URL` | Database connection string | `postgresql://user:pass@host/db` |
| `SECRET_KEY` | JWT signing key (generate with `openssl rand -hex 32`) | `a1b2c3d4...` |
| `MAILERSEND_API_KEY` | MailerSend API key | `mlsn.xxxxx` |
| `BACKEND_CORS_ORIGINS` | Allowed CORS origins (JSON array) | `["https://example.com"]` |

### Service Account IAM Roles (Must be granted)

The service account specified in `GCP_SERVICE_ACCOUNT` needs:

| Role | Purpose |
|------|---------|
| `roles/run.admin` | Deploy and manage Cloud Run services |
| `roles/cloudbuild.builds.editor` | Create and manage Cloud Build builds |
| `roles/artifactregistry.writer` | Push Docker images to Artifact Registry |
| `roles/artifactregistry.admin` | Create Artifact Registry repositories |
| `roles/iam.serviceAccountUser` | Act as other service accounts (project-level) |
| `roles/secretmanager.secretAccessor` | Read secrets from Secret Manager |

### ActAs Permission (CRITICAL - Must be granted separately)

In addition to project-level roles, the service account needs permission to act as the Cloud Run runtime account:

```bash
PROJECT_NUMBER=$(gcloud projects describe PROJECT_ID --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud iam service-accounts add-iam-policy-binding "$COMPUTE_SA" \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

This is **separate** from the project-level `roles/iam.serviceAccountUser` role!

## Verification Steps

### 1. Verify Service Account Setup
```bash
# Check service account exists
gcloud iam service-accounts describe github-actions@PROJECT_ID.iam.gserviceaccount.com

# Check IAM bindings
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com"
```

### 2. Verify Secrets Exist
```bash
# List secrets
gcloud secrets list --project=PROJECT_ID

# Check secret access
gcloud secrets get-iam-policy DATABASE_URL --project=PROJECT_ID
```

### 3. Verify GitHub Secrets
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Verify all required secrets are present
3. **Do not verify values** - GitHub doesn't show secret values

### 4. Test Deployment
```bash
# Push to main branch to trigger deployment
git push origin main

# Watch GitHub Actions
# Go to: https://github.com/YOUR_ORG/rework/actions

# Watch Cloud Build
gcloud builds list --project=PROJECT_ID --limit=5

# Watch Cloud Run deployment
gcloud run services describe rework-backend --region=us-central1 --project=PROJECT_ID
```

### 5. Verify Service is Running
```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe rework-backend \
  --region=us-central1 \
  --project=PROJECT_ID \
  --format='value(status.url)')

# Test health endpoint
curl $SERVICE_URL/health

# Expected response:
# {
#   "status": "healthy",
#   "database": "connected",
#   "version": "1.0.0",
#   "environment": "production"
# }
```

## Common Issues & Solutions

### Issue: "Permission denied to create Docker image"
**Cause**: Service account lacks Artifact Registry Writer role
**Solution**: Grant `roles/artifactregistry.writer` to service account

### Issue: "Failed to deploy to Cloud Run"
**Cause**: Service account lacks Cloud Run Admin role
**Solution**: Grant `roles/run.admin` to service account

### Issue: "Cannot access secrets"
**Cause**: Service account lacks Secret Accessor role for secrets
**Solution**: Grant `roles/secretmanager.secretAccessor` to service account for each secret

### Issue: "Workload Identity Provider not found"
**Cause**: Workload Identity Federation not set up
**Solution**: Follow Workload Identity setup guide: https://github.com/google-github-actions/auth#setup

### Issue: "CORS errors in frontend"
**Cause**: BACKEND_CORS_ORIGINS not set correctly
**Solution**: Update BACKEND_CORS_ORIGINS secret to include frontend domain:
```bash
echo -n '["https://www.remote-works.io","https://remote-works.io"]' | \
  gcloud secrets versions add BACKEND_CORS_ORIGINS --data-file=-
```

### Issue: "Database connection failed"
**Cause**: DATABASE_URL secret not set or incorrect
**Solution**: Update DATABASE_URL secret with correct connection string

### Issue: "Email notifications not working"
**Cause**: MAILERSEND_API_KEY not set or invalid
**Solution**:
1. Verify API key in MailerSend dashboard
2. Update secret: `gcloud secrets versions add MAILERSEND_API_KEY --data-file=-`
3. Ensure domain is verified in MailerSend

## Security Best Practices

✅ **Do**:
- Use Workload Identity Federation instead of service account keys
- Store secrets in Google Secret Manager
- Use separate service accounts for different purposes
- Grant minimum required permissions (principle of least privilege)
- Rotate secrets regularly
- Enable audit logging

❌ **Don't**:
- Store secrets in source code
- Commit secrets to git
- Use the same service account for everything
- Grant overly broad permissions (like Editor or Owner)
- Share service account keys
- Hardcode API keys in configuration files

## Next Steps

1. ✅ Verify all secrets are configured
2. ✅ Verify service account has correct permissions
3. ✅ Push changes to trigger deployment
4. ✅ Monitor deployment in GitHub Actions
5. ✅ Test the deployed service
6. ✅ Set up monitoring and alerts
7. ✅ Configure Cloud SQL for production database (if needed)

## Support

For issues:
1. Check GitHub Actions logs: https://github.com/your-org/rework/actions
2. Check Cloud Build logs: `gcloud builds list --project=PROJECT_ID`
3. Check Cloud Run logs: `gcloud run services logs read rework-backend --region=us-central1`
4. Review this documentation
5. Check `CLOUD_RUN_SETUP.md` for detailed setup instructions

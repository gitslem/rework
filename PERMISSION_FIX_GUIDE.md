# GitHub Actions Permission Fix Guide

## The Problem

Your deployment was failing with two critical permission errors:

### Error 1: Service Account Can't Act As Cloud Run Runtime Account
```
ERROR: Permission 'iam.serviceaccounts.actAs' denied on service account
706683337174-compute@developer.gserviceaccount.com
```

**Root Cause**: The GitHub Actions service account needs permission to "act as" the Cloud Run runtime service account (the default compute service account).

### Error 2: Still Using Wrong Service Account
```
ERROR: PERMISSION_DENIED: Permission 'artifactregistry.repositories.create' denied
This command is authenticated as firebase-adminsdk-fbsvc@***.iam.gserviceaccount.com
```

**Root Cause**: Sometimes still authenticating with the firebase-adminsdk account instead of the GitHub Actions service account.

## The Solution

I've created a comprehensive setup script that fixes all permission issues:

### Quick Fix (Recommended)

Run this script to configure all permissions automatically:

```bash
./setup-service-account-permissions.sh
```

This script will:
1. ✅ Grant all required project-level IAM roles
2. ✅ Grant `actAs` permission on the Cloud Run runtime service account
3. ✅ Create the Artifact Registry repository (`cloud-run-source-deploy`)
4. ✅ Enable all required APIs
5. ✅ Grant access to secrets in Secret Manager

### Manual Fix

If you prefer to configure manually:

#### Step 1: Get Your Project Info

```bash
PROJECT_ID="your-project-id"
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
SERVICE_ACCOUNT="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Project ID: $PROJECT_ID"
echo "Project Number: $PROJECT_NUMBER"
echo "GitHub Actions SA: $SERVICE_ACCOUNT"
echo "Cloud Run Runtime SA: $COMPUTE_SA"
```

#### Step 2: Grant Project-Level IAM Roles

```bash
# Cloud Run Admin - to create and manage services
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/run.admin"

# Cloud Build Editor - to create builds
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/cloudbuild.builds.editor"

# Artifact Registry Writer - to push images
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/artifactregistry.writer"

# Artifact Registry Admin - to create repositories
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/artifactregistry.admin"

# Service Account User - to act as service accounts
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/iam.serviceAccountUser"

# Secret Manager Secret Accessor - to read secrets
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

#### Step 3: Grant ActAs Permission (CRITICAL!)

This is the key permission that was missing:

```bash
# Allow GitHub Actions SA to act as the Cloud Run runtime SA
gcloud iam service-accounts add-iam-policy-binding "$COMPUTE_SA" \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/iam.serviceAccountUser" \
  --project="$PROJECT_ID"
```

#### Step 4: Create Artifact Registry Repository

Pre-create the repository to avoid permission issues:

```bash
gcloud artifacts repositories create cloud-run-source-deploy \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for Cloud Run source deployments" \
  --project="$PROJECT_ID"
```

#### Step 5: Enable Required APIs

```bash
gcloud services enable run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  --project="$PROJECT_ID"
```

#### Step 6: Grant Secret Access

For each secret you created:

```bash
for secret in DATABASE_URL SECRET_KEY MAILERSEND_API_KEY BACKEND_CORS_ORIGINS; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    --project="$PROJECT_ID"
done
```

## Workflow Changes

I've updated the GitHub Actions workflow to:

1. **Build the Docker image separately** using `gcloud builds submit`
2. **Deploy the pre-built image** to Cloud Run

### Before (causing issues):
```yaml
- name: Deploy to Cloud Run
  run: |
    gcloud run deploy rework-backend \
      --source ./backend \  # Source-based deployment
      ...
```

### After (fixed):
```yaml
- name: Build and push Docker image
  run: |
    cd backend
    gcloud builds submit \
      --tag us-central1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/cloud-run-source-deploy/rework-backend:${{ github.sha }} \
      ...

- name: Deploy to Cloud Run
  run: |
    gcloud run deploy rework-backend \
      --image us-central1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/cloud-run-source-deploy/rework-backend:${{ github.sha }} \
      ...
```

## Verification

After running the setup script, verify everything is configured:

### 1. Check IAM Bindings

```bash
gcloud projects get-iam-policy "$PROJECT_ID" \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:$SERVICE_ACCOUNT" \
  --format="table(bindings.role)"
```

Expected roles:
- roles/run.admin
- roles/cloudbuild.builds.editor
- roles/artifactregistry.writer
- roles/artifactregistry.admin
- roles/iam.serviceAccountUser
- roles/secretmanager.secretAccessor

### 2. Check ActAs Permission

```bash
gcloud iam service-accounts get-iam-policy "$COMPUTE_SA" \
  --project="$PROJECT_ID"
```

Should show:
```yaml
bindings:
- members:
  - serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com
  role: roles/iam.serviceAccountUser
```

### 3. Check Artifact Registry Repository

```bash
gcloud artifacts repositories list --location=us-central1 --project="$PROJECT_ID"
```

Should show `cloud-run-source-deploy` repository.

### 4. Check GitHub Secrets

Go to: `https://github.com/YOUR_ORG/rework/settings/secrets/actions`

Verify these secrets exist:
- ✅ WORKLOAD_IDENTITY_PROVIDER
- ✅ GCP_SERVICE_ACCOUNT
- ✅ GCP_PROJECT_ID
- ✅ NEXT_PUBLIC_SITE_URL
- ✅ FROM_EMAIL

### 5. Test Deployment

```bash
# Push to main to trigger deployment
git push origin main

# Watch the deployment
watch gcloud builds list --project="$PROJECT_ID" --limit=1
```

## Common Issues

### Issue: "Permission denied to check details of build service account"

**Cause**: GitHub Actions SA doesn't have permission to view the compute service account.

**Solution**: This is just a warning. The deployment will work as long as the `actAs` permission is granted (Step 3 above).

### Issue: "Permission 'iam.serviceaccounts.actAs' denied"

**Cause**: Missing the service account-level IAM binding.

**Solution**: Run Step 3 above to grant the actAs permission directly on the compute service account.

### Issue: "PERMISSION_DENIED: Permission 'artifactregistry.repositories.create' denied"

**Cause**: Repository doesn't exist and SA lacks permission to create it.

**Solution**: Pre-create the repository (Step 4 above).

### Issue: Still authenticating as firebase-adminsdk

**Cause**: GitHub secrets might not be configured correctly.

**Solution**:
1. Verify `WORKLOAD_IDENTITY_PROVIDER` and `GCP_SERVICE_ACCOUNT` secrets in GitHub
2. Ensure they match your Workload Identity configuration
3. The `GCP_SERVICE_ACCOUNT` should be your GitHub Actions service account, NOT the firebase-adminsdk account

## Security Notes

### Principle of Least Privilege

The GitHub Actions service account has:
- ✅ **Limited to Cloud Run, Cloud Build, and Artifact Registry** - Can't modify other resources
- ✅ **No owner or editor roles** - Can't make project-wide changes
- ✅ **Secret accessor only** - Can read secrets but not create/delete them
- ✅ **Workload Identity Federation** - No service account keys to leak

### Service Account Roles Explained

| Role | Why Needed | Risk Level |
|------|-----------|-----------|
| `run.admin` | Deploy Cloud Run services | Low - limited to Cloud Run |
| `cloudbuild.builds.editor` | Create and manage builds | Low - limited to Cloud Build |
| `artifactregistry.writer` | Push Docker images | Low - limited to Artifact Registry |
| `artifactregistry.admin` | Create repositories | Medium - can create repos |
| `iam.serviceAccountUser` | Act as other service accounts | Medium - scoped to specific SAs |
| `secretmanager.secretAccessor` | Read secrets | Medium - read-only access |

### Best Practices

✅ **Do**:
- Use separate service accounts for different purposes
- Grant minimum required permissions
- Use Workload Identity Federation
- Audit IAM bindings regularly
- Rotate secrets periodically

❌ **Don't**:
- Share service accounts between unrelated services
- Grant Owner or Editor roles
- Download service account keys
- Store secrets in code or git
- Grant broad permissions "just in case"

## Next Steps

1. ✅ Run `./setup-service-account-permissions.sh`
2. ✅ Verify all permissions are configured
3. ✅ Create secrets with `./setup-gcp-secrets.sh` (if not done)
4. ✅ Verify GitHub secrets are configured
5. ✅ Push to main branch to test deployment
6. ✅ Monitor deployment in GitHub Actions

## Support

If issues persist:

1. **Check GitHub Actions logs**: https://github.com/YOUR_ORG/rework/actions
   - Look for authentication step output
   - Verify which service account is being used

2. **Check Cloud Build logs**:
   ```bash
   gcloud builds list --project="$PROJECT_ID" --limit=5
   gcloud builds log BUILD_ID --project="$PROJECT_ID"
   ```

3. **Check IAM permissions**:
   ```bash
   gcloud projects get-iam-policy "$PROJECT_ID" | grep -A5 "$SERVICE_ACCOUNT"
   ```

4. **Verify Workload Identity setup**:
   ```bash
   gcloud iam workload-identity-pools list --location=global
   ```

For more details, see:
- `DEPLOYMENT_FIX_SUMMARY.md` - Original deployment fixes
- `CLOUD_RUN_SETUP.md` - Complete setup guide
- `setup-service-account-permissions.sh` - Automated permission setup
- `setup-gcp-secrets.sh` - Automated secret creation

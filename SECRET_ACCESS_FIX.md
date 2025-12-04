# Cloud Run Secret Access Fix

## The Current Issue

Your Cloud Run deployment is now getting past the initial permission error, but failing with a new error about secret access:

```
ERROR: Permission denied on secret: projects/706683337174/secrets/DATABASE_URL/versions/latest
for Revision service account. The service account used must be granted the
'Secret Manager Secret Accessor' role (roles/secretmanager.secretAccessor)
```

## What's Happening

1. ✅ **Fixed**: The `iam.serviceaccounts.actAs` permission error is resolved
2. ❌ **New Issue**: The GitHub Actions service account (now used as the Cloud Run runtime service account) doesn't have permission to read the secrets

When we added `--service-account ${{ secrets.GCP_SERVICE_ACCOUNT }}` to the deployment, we made Cloud Run use the GitHub Actions service account at runtime. This service account needs access to read the secrets from Secret Manager.

## The Quick Fix

Run this script to grant the necessary permissions:

```bash
./grant-secret-access.sh
```

Or with a specific project ID:

```bash
./grant-secret-access.sh YOUR_PROJECT_ID
```

This script will grant the `secretmanager.secretAccessor` role to your GitHub Actions service account for all four secrets:
- `DATABASE_URL`
- `SECRET_KEY`
- `MAILERSEND_API_KEY`
- `BACKEND_CORS_ORIGINS`

## Manual Fix (Alternative)

If you prefer to do this manually:

```bash
# Set your project ID
PROJECT_ID="your-project-id"
SERVICE_ACCOUNT="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant access to each secret
for secret in DATABASE_URL SECRET_KEY MAILERSEND_API_KEY BACKEND_CORS_ORIGINS; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    --project="$PROJECT_ID"
done
```

## Verification

After running the script, verify the permissions:

```bash
# Check one of the secrets
gcloud secrets get-iam-policy DATABASE_URL --project=YOUR_PROJECT_ID
```

You should see your GitHub Actions service account listed with the `secretmanager.secretAccessor` role.

## What Changed

### Previous Setup
- Cloud Run tried to use the default compute service account
- Deployment failed: no permission to "act as" that account

### Current Setup (after first fix)
- Cloud Run uses the GitHub Actions service account (via `--service-account` flag)
- Deployment gets further but fails: service account can't read secrets

### Final Setup (after this fix)
- Cloud Run uses the GitHub Actions service account
- Service account has permission to read all required secrets
- Deployment should succeed ✓

## Why This Approach

We're using the GitHub Actions service account as both:
1. The **deploying** account (runs `gcloud run deploy`)
2. The **runtime** account (Cloud Run service runs as this account)

Benefits:
- ✅ Simpler setup - one service account instead of two
- ✅ No need for `actAs` permissions between service accounts
- ✅ Uses Workload Identity Federation (no service account keys)
- ✅ Follows Google Cloud best practices

## Security Note

The GitHub Actions service account now has:
- `run.admin` - Deploy and manage Cloud Run services
- `artifactregistry.writer` - Push Docker images
- `secretmanager.secretAccessor` - Read secrets (for deployment AND runtime)

This is appropriate for a CI/CD service account that both deploys and runs the application.

## Next Steps

1. ✅ Run `./grant-secret-access.sh`
2. ✅ Verify permissions are granted
3. ✅ Push changes to trigger deployment
4. ✅ Monitor deployment in GitHub Actions

The deployment should now succeed!

# GitHub Workload Identity Authentication Fix

## The Problem

Your GitHub Actions workflow is **still authenticating with the wrong service account**:

```
This command is authenticated as firebase-adminsdk-fbsvc@remote-worksio.iam.gserviceaccount.com
```

It should be authenticating as:
```
github-actions@remote-worksio.iam.gserviceaccount.com
```

## Root Cause

The GitHub secrets `WORKLOAD_IDENTITY_PROVIDER` and/or `GCP_SERVICE_ACCOUNT` are either:
1. Not configured in GitHub
2. Configured with wrong values
3. Workload Identity Federation pool isn't set up correctly

## Step-by-Step Fix

### Step 1: Verify GitHub Secrets

Go to your GitHub repository:
```
https://github.com/YOUR_ORG/rework/settings/secrets/actions
```

Check if these secrets exist:
- ✅ `WORKLOAD_IDENTITY_PROVIDER`
- ✅ `GCP_SERVICE_ACCOUNT`
- ✅ `GCP_PROJECT_ID`

**If they DON'T exist or have wrong values**, continue to Step 2.

### Step 2: Set Up Workload Identity Federation

Workload Identity Federation allows GitHub Actions to authenticate to Google Cloud without using service account keys.

#### Option A: Using the Google Cloud Console (Easier)

1. **Go to Workload Identity Pools**:
   https://console.cloud.google.com/iam-admin/workload-identity-pools?project=remote-worksio

2. **Create a Pool** (if you don't have one):
   - Click "CREATE POOL"
   - Pool name: `github-actions-pool`
   - Pool ID: `github-actions-pool`
   - Description: "Pool for GitHub Actions"
   - Click "CONTINUE"
   - Click "CREATE"

3. **Add a Provider to the Pool**:
   - Click on your pool name
   - Click "ADD PROVIDER"
   - Provider type: Select "OIDC"
   - Provider name: `github-provider`
   - Provider ID: `github-provider`
   - Issuer (URL): `https://token.actions.githubusercontent.com`
   - Audiences: Select "Default audience"
   - Click "CONTINUE"

4. **Configure Provider Attributes**:
   - Attribute mappings:
     ```
     google.subject = assertion.sub
     attribute.actor = assertion.actor
     attribute.repository = assertion.repository
     ```
   - Attribute conditions (IMPORTANT - restricts to your repo):
     ```
     assertion.repository == "YOUR_GITHUB_ORG/rework"
     ```
     Replace `YOUR_GITHUB_ORG` with your GitHub organization/username
   - Click "SAVE"

5. **Grant Service Account Access**:
   - After creating the provider, click on it
   - Click "GRANT ACCESS"
   - Select service account: `github-actions@remote-worksio.iam.gserviceaccount.com`
   - Click "SAVE"

6. **Get the Workload Identity Provider Resource Name**:
   - Copy the full resource name, it looks like:
     ```
     projects/706683337174/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider
     ```

#### Option B: Using gcloud CLI (Advanced)

```bash
# Set variables
export PROJECT_ID="remote-worksio"
export PROJECT_NUMBER="706683337174"
export POOL_NAME="github-actions-pool"
export PROVIDER_NAME="github-provider"
export SERVICE_ACCOUNT="github-actions@remote-worksio.iam.gserviceaccount.com"
export REPO="YOUR_GITHUB_ORG/rework"  # Replace with your GitHub org/user and repo

# Create Workload Identity Pool
gcloud iam workload-identity-pools create "$POOL_NAME" \
  --location="global" \
  --display-name="GitHub Actions Pool" \
  --description="Pool for GitHub Actions authentication" \
  --project="$PROJECT_ID"

# Create OIDC Provider
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
  --location="global" \
  --workload-identity-pool="$POOL_NAME" \
  --display-name="GitHub Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository == '$REPO'" \
  --project="$PROJECT_ID"

# Grant service account access
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/attribute.repository/$REPO" \
  --project="$PROJECT_ID"

# Get the Workload Identity Provider resource name
echo "WORKLOAD_IDENTITY_PROVIDER:"
echo "projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/providers/$PROVIDER_NAME"
```

### Step 3: Configure GitHub Secrets

Now add these secrets to your GitHub repository:

Go to: `https://github.com/YOUR_ORG/rework/settings/secrets/actions`

#### Add or Update These Secrets:

1. **WORKLOAD_IDENTITY_PROVIDER**
   ```
   projects/706683337174/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider
   ```
   (Use the value from Step 2)

2. **GCP_SERVICE_ACCOUNT**
   ```
   github-actions@remote-worksio.iam.gserviceaccount.com
   ```

3. **GCP_PROJECT_ID**
   ```
   remote-worksio
   ```

4. **NEXT_PUBLIC_SITE_URL**
   ```
   https://www.remote-works.io
   ```
   (or your actual frontend URL)

5. **FROM_EMAIL**
   ```
   noreply@remote-works.io
   ```
   (or your actual sender email)

### Step 4: Grant Cloud Build Permissions

Run this script (I've created it for you):

```bash
./fix-cloud-build-permissions.sh
```

This grants the Cloud Build service account the required permissions.

### Step 5: Create Google Cloud Secrets

Run this script to create the required secrets:

```bash
./setup-gcp-secrets.sh
```

You'll be prompted for:
- DATABASE_URL
- SECRET_KEY
- MAILERSEND_API_KEY
- BACKEND_CORS_ORIGINS

### Step 6: Test the Deployment

Push a change to trigger the workflow:

```bash
git add .
git commit -m "Test deployment with correct authentication"
git push origin main
```

Watch the GitHub Actions workflow to verify it's using the correct service account.

## Verification

After setup, verify the authentication in GitHub Actions logs. You should see:

```
✓ Authenticated as github-actions@remote-worksio.iam.gserviceaccount.com
```

Instead of:
```
✗ Authenticated as firebase-adminsdk-fbsvc@remote-worksio.iam.gserviceaccount.com
```

## Alternative: Use Service Account Key (NOT RECOMMENDED)

If Workload Identity Federation is too complex, you can use a service account key (less secure):

### Step 1: Create Service Account Key

```bash
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@remote-worksio.iam.gserviceaccount.com \
  --project=remote-worksio
```

### Step 2: Add to GitHub Secrets

1. Go to: `https://github.com/YOUR_ORG/rework/settings/secrets/actions`
2. Add a new secret named `GCP_SERVICE_ACCOUNT_KEY`
3. Paste the ENTIRE contents of `key.json`
4. **Delete** `key.json` from your local machine immediately

### Step 3: Update GitHub Actions Workflow

Replace the authentication step with:

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}
```

⚠️ **WARNING**: Service account keys are less secure than Workload Identity Federation. Keys can be leaked and don't expire. Use Workload Identity if possible.

## Troubleshooting

### Issue: "workload identity pool does not exist"

**Solution**: The pool wasn't created correctly. Go back to Step 2 and create it again.

### Issue: "Caller does not have permission"

**Solution**: The service account needs the `roles/iam.workloadIdentityUser` role. Run:

```bash
gcloud iam service-accounts add-iam-policy-binding github-actions@remote-worksio.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/706683337174/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/YOUR_ORG/rework" \
  --project=remote-worksio
```

### Issue: Still using firebase-adminsdk account

**Possible causes**:
1. GitHub secrets not configured correctly
2. Workload Identity pool condition doesn't match your repository
3. Provider not linked to service account

**Solution**: Double-check all steps above, especially the repository name in the attribute condition.

### Issue: "Token exchange failed"

**Solution**: The OIDC token from GitHub doesn't match the provider configuration. Check:
- Issuer URI is exactly: `https://token.actions.githubusercontent.com`
- Attribute condition matches your repository name exactly

## Quick Reference

After successful setup, you should have:

### Google Cloud:
- ✅ Workload Identity Pool: `github-actions-pool`
- ✅ OIDC Provider: `github-provider`
- ✅ Service Account: `github-actions@remote-worksio.iam.gserviceaccount.com`
- ✅ Cloud Build SA permissions granted
- ✅ Artifact Registry repository: `cloud-run-source-deploy`
- ✅ Secrets created: DATABASE_URL, SECRET_KEY, MAILERSEND_API_KEY, BACKEND_CORS_ORIGINS

### GitHub Secrets:
- ✅ WORKLOAD_IDENTITY_PROVIDER
- ✅ GCP_SERVICE_ACCOUNT
- ✅ GCP_PROJECT_ID
- ✅ NEXT_PUBLIC_SITE_URL
- ✅ FROM_EMAIL

### Permissions Granted:
- ✅ github-actions@remote-worksio.iam.gserviceaccount.com:
  - roles/run.admin
  - roles/cloudbuild.builds.editor
  - roles/artifactregistry.writer
  - roles/artifactregistry.admin
  - roles/iam.serviceAccountUser
  - roles/secretmanager.secretAccessor
  - actAs permission on 706683337174-compute@developer.gserviceaccount.com

- ✅ 706683337174@cloudbuild.gserviceaccount.com:
  - roles/iam.serviceAccountUser
  - roles/artifactregistry.writer
  - roles/storage.objectViewer
  - roles/serviceusage.serviceUsageConsumer

## Need Help?

If you're still having issues, please provide:
1. Your GitHub Actions workflow logs (the authentication step)
2. Your GitHub repository URL (public or org/repo name)
3. Screenshot of your Workload Identity Pool configuration
4. Output of: `gcloud iam workload-identity-pools providers describe github-provider --location=global --workload-identity-pool=github-actions-pool --project=remote-worksio`

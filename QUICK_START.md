# Quick Start: Deploy Backend to Google Cloud Run

This is a simplified checklist to get your backend deployed quickly. For detailed instructions, see `CLOUD_RUN_SETUP.md`.

## ✅ Pre-Deployment Checklist

### 1. Enable Google Cloud APIs (5 minutes)

Visit Google Cloud Console and enable these APIs for your project:

- [ ] Cloud Run API: https://console.cloud.google.com/apis/library/run.googleapis.com
- [ ] Container Registry API: https://console.cloud.google.com/apis/library/containerregistry.googleapis.com
- [ ] Cloud Build API: https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com

### 2. Add GitHub Secrets (10 minutes)

Go to your GitHub repo: **Settings → Secrets and variables → Actions**

Add these new secrets:

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `MAILERSEND_API_KEY` | `mlsn.xxxxx...` | https://app.mailersend.com/api-tokens |
| `SECRET_KEY` | Random 64-char hex | Run: `openssl rand -hex 32` |
| `DATABASE_URL` | `sqlite:///./remoteworks.db` | Use SQLite for now, PostgreSQL later |
| `BACKEND_CORS_ORIGINS` | `["https://www.remote-works.io"]` | Your frontend URL in JSON array format |

### 3. Grant Service Account Permissions (5 minutes)

Your Firebase service account needs Cloud Run permissions.

**Option A: Via Cloud Console**
1. Go to: https://console.cloud.google.com/iam-admin/iam
2. Find your Firebase service account (looks like `firebase-adminsdk-xxxxx@...`)
3. Click Edit (pencil icon)
4. Add these roles:
   - Cloud Run Admin
   - Service Account User
   - Storage Admin
   - Container Registry Service Agent
5. Save

**Option B: Via Command Line**
```bash
# Replace with your service account email
SA_EMAIL="firebase-adminsdk-xxxxx@remote-worksio.iam.gserviceaccount.com"
PROJECT_ID="remote-worksio"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/containerregistry.ServiceAgent"
```

## 🚀 Deploy

Once the above is complete, simply push to main:

```bash
git add .
git commit -m "Add Cloud Run deployment"
git push origin main
```

Watch the deployment progress:
- GitHub Actions: https://github.com/YOUR-USERNAME/rework/actions
- Cloud Run Console: https://console.cloud.google.com/run

## ✅ Verify Deployment

### 1. Check Cloud Run Service

Visit: https://console.cloud.google.com/run

You should see `rework-backend` running. Click it to get the URL.

### 2. Test Backend Health

```bash
# Replace with your actual Cloud Run URL
curl https://rework-backend-xxxxx-uc.a.run.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0",
  "environment": "production"
}
```

### 3. Test Email Notifications

1. Open your frontend: https://www.remote-works.io
2. Log in as an agent
3. Create a project for a candidate
4. Open browser console (F12) and check for email logs
5. Candidate should receive an email

## 🐛 Troubleshooting

### Deployment fails with "Permission denied"
→ Go back to Step 3 and verify service account roles

### "CORS error" in browser console
→ Check `BACKEND_CORS_ORIGINS` includes your frontend URL

### Emails not sending
→ Verify `MAILERSEND_API_KEY` is set correctly and domain is verified

### More help
→ See `CLOUD_RUN_SETUP.md` for detailed troubleshooting

## 📊 Monitor Your Application

- **Backend Logs**: https://console.cloud.google.com/run/detail/us-central1/rework-backend/logs
- **Costs**: https://console.cloud.google.com/billing
- **Health**: https://YOUR-BACKEND-URL/health

## 💰 Costs

Cloud Run free tier includes:
- 2 million requests/month
- 360,000 GB-seconds memory/month
- 180,000 vCPU-seconds/month

Your email application should easily stay within free tier limits!

## 📝 Next Steps

1. ✅ Deploy and verify backend works
2. ✅ Test email notifications
3. ✅ Monitor logs for a few days
4. ⏭️ Consider upgrading to Cloud SQL PostgreSQL for production (see `CLOUD_RUN_SETUP.md`)
5. ⏭️ Set up monitoring and alerting
6. ⏭️ Configure custom domain for backend (optional)

---

**Need help?** Check `CLOUD_RUN_SETUP.md` for detailed documentation.

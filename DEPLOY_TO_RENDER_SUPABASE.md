# Deploy Remote Works to Render and Supabase

This guide will walk you through deploying the Remote Works platform using Render for hosting and Supabase for the PostgreSQL database.

## Architecture Overview

- **Frontend**: Next.js app deployed on Render (or Vercel)
- **Backend**: FastAPI app deployed on Render
- **Database**: PostgreSQL on Supabase
- **File Storage**: AWS S3 (optional)
- **Caching**: Redis on Render or Upstash (optional)

---

## Prerequisites

1. GitHub account (with your code pushed to a repository)
2. Render account (sign up at https://render.com)
3. Supabase account (sign up at https://supabase.com)
4. Optional: AWS account for S3 storage
5. Optional: SendGrid account for emails
6. Optional: Stripe account for payments

---

## Part 1: Set Up Supabase Database

### Step 1: Create a Supabase Project

1. Go to https://supabase.com and log in
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `remoteworks` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is fine to start

4. Click **"Create new project"** and wait for it to initialize (2-3 minutes)

### Step 2: Get Your Database Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection String** section
3. Select **URI** tab
4. Copy the connection string. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijk.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you set earlier
6. **Save this connection string** - you'll need it for Render

### Step 3: Configure Supabase Database (Optional)

The database tables will be created automatically when the backend starts, but you can also:

1. Go to **SQL Editor** in Supabase
2. You can run custom SQL if needed
3. Use **Table Editor** to view your data once the app is running

---

## Part 2: Deploy Backend to Render

### Step 1: Create Backend Web Service

1. Go to https://render.com and log in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

   **Basic Settings:**
   - **Name**: `remoteworks-api` (or your preferred name)
   - **Region**: Choose same/close to Supabase region
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 2: Configure Environment Variables

In the **Environment** section, add these environment variables:

**Required Variables:**

```bash
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Security (generate with: openssl rand -hex 32)
SECRET_KEY=your-generated-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Environment
ENVIRONMENT=production

# CORS (update after deploying frontend)
BACKEND_CORS_ORIGINS=https://remoteworks-frontend.onrender.com
FRONTEND_URL=https://remoteworks-frontend.onrender.com
```

**Optional Variables:**

```bash
# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com

# Stripe Payments
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# AWS S3 File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=remoteworks-uploads
AWS_REGION=us-east-1

# Redis Cache (optional)
REDIS_URL=redis://localhost:6379/0

# OpenAI (for AI matching)
OPENAI_API_KEY=your-openai-api-key
```

### Step 3: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for the deployment (3-5 minutes)
3. Once deployed, you'll get a URL like: `https://remoteworks-api.onrender.com`
4. Test the API by visiting: `https://remoteworks-api.onrender.com/health`
   - You should see: `{"status": "healthy", "database": "connected", "version": "1.0.0"}`
5. Visit API docs: `https://remoteworks-api.onrender.com/docs`

### Step 4: Troubleshooting Backend

If deployment fails:

1. **Check Logs**: Click on "Logs" tab to see error messages
2. **Database Connection**: Verify DATABASE_URL is correct
3. **Dependencies**: Ensure all packages in requirements.txt are compatible
4. **Port**: Render automatically sets $PORT, make sure start command uses it

---

## Part 3: Deploy Frontend to Render

### Step 1: Create Frontend Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Select your repository again
3. Configure the service:

   **Basic Settings:**
   - **Name**: `remoteworks-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 2: Configure Frontend Environment Variables

Add these environment variables:

```bash
# API URL (use your backend URL from Part 2)
NEXT_PUBLIC_API_URL=https://remoteworks-api.onrender.com/api/v1

# Node Environment
NODE_ENV=production
```

### Step 3: Deploy Frontend

1. Click **"Create Web Service"**
2. Wait for deployment (5-7 minutes)
3. Once deployed, you'll get a URL like: `https://remoteworks-frontend.onrender.com`
4. Visit the URL to see your app!

### Step 4: Update Backend CORS

Now that you have the frontend URL, update the backend:

1. Go to your backend service in Render
2. Go to **Environment** tab
3. Update these variables:
   ```bash
   BACKEND_CORS_ORIGINS=https://remoteworks-frontend.onrender.com
   FRONTEND_URL=https://remoteworks-frontend.onrender.com
   ```
4. Save changes (backend will auto-redeploy)

---

## Part 4: Alternative - Deploy Frontend to Vercel (Recommended)

Vercel is optimized for Next.js and often faster than Render for frontend:

### Step 1: Deploy to Vercel

1. Go to https://vercel.com and log in
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 2: Add Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://remoteworks-api.onrender.com/api/v1
NODE_ENV=production
```

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. You'll get a URL like: `https://remoteworks.vercel.app`
4. Update backend CORS to include this Vercel URL

---

## Part 5: Database Migrations (When Needed)

### Setup Alembic Migrations

When you need to modify the database schema:

1. **Create initial migration** (one time):
   ```bash
   cd backend
   alembic revision --autogenerate -m "Initial migration"
   ```

2. **Apply migrations locally**:
   ```bash
   alembic upgrade head
   ```

3. **For production**, update `backend/build.sh`:
   ```bash
   #!/usr/bin/env bash
   set -o errexit

   pip install -r requirements.txt
   alembic upgrade head  # Uncomment this line
   ```

4. **Redeploy** backend on Render to apply migrations

---

## Part 6: Post-Deployment Configuration

### Custom Domain (Optional)

**For Backend:**
1. In Render, go to backend service → **Settings** → **Custom Domain**
2. Add your domain: `api.yourdomain.com`
3. Configure DNS with provided CNAME records

**For Frontend:**
1. In Render/Vercel, add custom domain: `yourdomain.com`
2. Configure DNS settings

### SSL Certificates

Both Render and Vercel automatically provision SSL certificates for HTTPS.

### Environment Variables Best Practices

1. **Never commit** `.env` files to Git
2. **Use strong secrets**: Generate SECRET_KEY with `openssl rand -hex 32`
3. **Rotate keys** regularly in production
4. **Backup** your environment variables securely

---

## Part 7: Monitoring and Maintenance

### Health Checks

- **Backend**: `https://your-backend.onrender.com/health`
- Monitor database connection status

### Logs

- **Render**: View logs in dashboard under "Logs" tab
- **Supabase**: Monitor database performance in dashboard

### Scaling

**Free Tier Limitations:**
- Render Free: 750 hours/month, sleeps after 15 min inactivity
- Supabase Free: 500 MB database, 2 GB bandwidth

**Upgrade when needed:**
- Render: Starter plan ($7/month) for always-on service
- Supabase: Pro plan ($25/month) for better performance

---

## Part 8: Testing Your Deployment

### 1. Test Backend API

```bash
# Health check
curl https://your-backend.onrender.com/health

# API documentation
# Visit: https://your-backend.onrender.com/docs

# Test registration
curl -X POST https://your-backend.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","role":"freelancer"}'
```

### 2. Test Frontend

1. Visit your frontend URL
2. Try registering a new account
3. Login with credentials
4. Test dashboard features

### 3. Test Database

1. Go to Supabase → **Table Editor**
2. Check that tables were created: `users`, `profiles`, `projects`, etc.
3. Verify data from your test registration

---

## Troubleshooting Common Issues

### Issue: Backend can't connect to database

**Solution:**
- Verify DATABASE_URL is correct
- Check Supabase project is running
- Ensure no firewall blocking connection
- Check Supabase service status

### Issue: CORS errors in browser

**Solution:**
- Update BACKEND_CORS_ORIGINS to include frontend URL
- Include both HTTP and HTTPS variants if testing
- Check browser console for exact CORS error

### Issue: Frontend shows "Cannot connect to API"

**Solution:**
- Verify NEXT_PUBLIC_API_URL is correct
- Check backend is running: visit /health endpoint
- Check backend logs for errors
- Ensure backend CORS allows frontend

### Issue: Render service keeps sleeping

**Solution:**
- Upgrade to paid plan for always-on service
- Or use a uptime monitoring service to ping every 10 minutes

### Issue: Database migration errors

**Solution:**
- Check Alembic migrations are in sync
- Manually run migrations in Supabase SQL editor if needed
- Verify DATABASE_URL has write permissions

---

## Cost Estimate

### Free Tier (for testing)
- **Supabase**: Free (500 MB database)
- **Render Backend**: Free (sleeps after 15 min)
- **Render Frontend**: Free (sleeps after 15 min)
- **Vercel Frontend**: Free (better performance)
- **Total**: $0/month

### Production Tier (recommended)
- **Supabase Pro**: $25/month (8 GB database, better performance)
- **Render Starter**: $7/month backend (always-on)
- **Vercel Pro**: $20/month (optional, free tier is good)
- **Total**: ~$32-52/month

---

## Security Checklist

- [ ] Generated strong SECRET_KEY
- [ ] Enabled HTTPS (automatic with Render/Vercel)
- [ ] Configured CORS properly
- [ ] Database password is strong
- [ ] Environment variables not committed to Git
- [ ] API rate limiting configured (optional)
- [ ] Regular backups enabled in Supabase
- [ ] Monitoring and alerts set up

---

## Next Steps

1. **Set up monitoring**: Use tools like Sentry for error tracking
2. **Configure backups**: Enable Supabase daily backups
3. **Add analytics**: Google Analytics or Plausible
4. **Email service**: Configure SendGrid for transactional emails
5. **Payment processing**: Set up Stripe webhooks
6. **File uploads**: Configure AWS S3 bucket
7. **Custom domain**: Point your domain to Render/Vercel

---

## Support

If you encounter issues:

1. **Check logs** in Render dashboard
2. **Review Supabase logs** in dashboard
3. **Test API endpoints** with Postman or curl
4. **Check environment variables** are set correctly
5. **Verify database connection** via /health endpoint

---

## Useful Commands

```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Test backend locally
cd backend
uvicorn main:app --reload

# Test frontend locally
cd frontend
npm run dev

# Check backend logs on Render
# (Use Render dashboard → Logs tab)

# Connect to Supabase database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

---

## Conclusion

You now have a fully deployed Remote Works platform on Render and Supabase! The deployment is production-ready with:

- ✅ Secure HTTPS connections
- ✅ PostgreSQL database on Supabase
- ✅ Auto-scaling infrastructure
- ✅ Health monitoring
- ✅ Professional API documentation
- ✅ Modern frontend with Next.js

Happy deploying! 🚀

# 🚀 Deployment Guide

## Overview

This guide covers deploying the Remote Works platform to production using popular hosting services.

**Recommended Stack:**
- Frontend: Vercel (free tier)
- Backend: Railway or Render (free tier)
- Database: Railway PostgreSQL or Supabase (free tier)

Total Cost: **$0/month** (on free tiers)

---

## Option 1: Railway (Recommended - Easiest)

Railway provides hosting for both backend and database in one place.

### Step 1: Deploy Database

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click "New Project"
4. Choose "Provision PostgreSQL"
5. Wait for deployment
6. Click on PostgreSQL → Variables
7. Copy the `DATABASE_URL` (you'll need this)

### Step 2: Deploy Backend

1. In Railway, click "New" → "GitHub Repo"
2. Select your `remote-works-platform` repository
3. Railway will detect the Python app
4. Click on the service → Settings
5. Set Root Directory to: `backend`
6. Add Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 3: Set Environment Variables

In the backend service → Variables tab, add:

```
DATABASE_URL=postgresql://... (from Step 1)
SECRET_KEY=generate-a-strong-random-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["https://your-frontend-url.vercel.app"]
```

To generate a SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 4: Deploy Frontend on Vercel

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your `remote-works-platform` repository
5. Framework Preset: Next.js
6. Root Directory: `frontend`
7. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.up.railway.app/api/v1`
8. Deploy!

### Step 5: Update CORS

1. Go back to Railway backend service
2. Update `BACKEND_CORS_ORIGINS` with your Vercel URL:
   ```
   BACKEND_CORS_ORIGINS=["https://your-app.vercel.app"]
   ```
3. Backend will auto-redeploy

✅ **Done!** Your app is live!

---

## Option 2: Render + Supabase

### Step 1: Deploy Database on Supabase

1. Go to https://supabase.com
2. Sign up and create a new project
3. Wait for database setup
4. Go to Settings → Database
5. Copy the Connection String (URI format)

### Step 2: Deploy Backend on Render

1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Settings:
   - Name: `remote-works-backend`
   - Root Directory: `backend`
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Environment Variables (same as Railway option)
7. Create Web Service

### Step 3: Deploy Frontend on Vercel

Same as Railway option Step 4 above.

---

## Option 3: AWS/DigitalOcean (Advanced)

For production-scale applications with more control.

### Backend (EC2/Droplet)

```bash
# SSH into server
ssh user@your-server-ip

# Install dependencies
sudo apt update
sudo apt install python3-pip postgresql nginx

# Clone repository
git clone https://github.com/yourusername/remote-works-platform.git
cd remote-works-platform/backend

# Set up Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set up environment variables
nano .env
# Add your production variables

# Set up Gunicorn
pip install gunicorn

# Create systemd service
sudo nano /etc/systemd/system/remoteworks.service
```

Service file:
```ini
[Unit]
Description=Remote Works API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/remote-works-platform/backend
Environment="PATH=/home/ubuntu/remote-works-platform/backend/venv/bin"
ExecStart=/home/ubuntu/remote-works-platform/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl start remoteworks
sudo systemctl enable remoteworks

# Configure Nginx
sudo nano /etc/nginx/sites-available/remoteworks
```

Nginx config:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/remoteworks /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# Set up SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## Post-Deployment Checklist

### Security
- [ ] Change SECRET_KEY to strong random value
- [ ] Enable HTTPS/SSL
- [ ] Update CORS settings
- [ ] Set up proper environment variables
- [ ] Never expose .env files
- [ ] Use strong database passwords

### Performance
- [ ] Enable database connection pooling
- [ ] Set up Redis for caching
- [ ] Configure CDN for static assets
- [ ] Enable gzip compression

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Monitor database performance

### Database
- [ ] Run migrations
- [ ] Set up automated backups
- [ ] Configure database indexes
- [ ] Test database connection

---

## Environment Variables Cheat Sheet

### Backend (.env)

**Required:**
```env
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-secret-key
BACKEND_CORS_ORIGINS=["https://your-frontend.com"]
```

**Optional (for full features):**
```env
SENDGRID_API_KEY=your-key
STRIPE_SECRET_KEY=your-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-key
OPENAI_API_KEY=your-key
REDIS_URL=redis://host:port
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-backend-url/api/v1
```

---

## Common Deployment Issues

### Issue: CORS Error
**Solution:** Update `BACKEND_CORS_ORIGINS` with your frontend URL

### Issue: Database Connection Failed
**Solution:** 
- Check DATABASE_URL format
- Ensure database is accessible from backend server
- Check firewall rules

### Issue: 502 Bad Gateway
**Solution:**
- Check if backend is running
- Check logs: `railway logs` or check Render logs
- Verify port binding is correct

### Issue: Build Failed
**Solution:**
- Check requirements.txt has all dependencies
- Verify Python version compatibility
- Check for syntax errors

---

## Scaling Considerations

### For High Traffic:

1. **Database:**
   - Use connection pooling
   - Add read replicas
   - Implement caching (Redis)

2. **Backend:**
   - Increase worker processes
   - Use load balancer
   - Horizontal scaling

3. **Frontend:**
   - Enable ISR (Incremental Static Regeneration)
   - Use CDN
   - Optimize images

---

## Monitoring & Maintenance

### Free Tools:
- **Uptime:** UptimeRobot
- **Errors:** Sentry
- **Analytics:** Vercel Analytics
- **Logs:** Built-in platform logs

### Commands:

```bash
# View Railway logs
railway logs

# View Render logs
(Check dashboard)

# Check application status
curl https://your-api-url/health

# Database backup (Railway)
railway run pg_dump > backup.sql
```

---

## Cost Optimization

### Free Tier Limits:
- **Railway:** 500 hours/month, 1GB RAM
- **Render:** 750 hours/month, 512MB RAM
- **Vercel:** Unlimited bandwidth, 100GB/month
- **Supabase:** 500MB database, 2GB bandwidth

### Tips:
1. Use image optimization
2. Implement caching
3. Minimize API calls
4. Use database indexes
5. Clean up old data

---

## Support Resources

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs

---

**Next Steps:**
1. Deploy your application
2. Test all features
3. Set up monitoring
4. Share your live URL!

Good luck with your deployment! 🚀

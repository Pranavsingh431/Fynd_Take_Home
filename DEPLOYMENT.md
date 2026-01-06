# Deployment Guide

This guide covers deploying all three components of the Fynd Take-Home Assignment.

## Prerequisites

- GitHub account
- Vercel account (free tier is sufficient)
- Render account OR Neon/Supabase for database
- OpenRouter API key

---

## 1. Database Setup (PostgreSQL)

### Option A: Render PostgreSQL (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `fynd-reviews-db`
   - Database: `fynd_reviews`
   - User: (auto-generated)
   - Region: Choose closest to you
   - Plan: Free
4. Click "Create Database"
5. Copy the "External Database URL" (starts with `postgresql://`)

### Option B: Neon

1. Go to [Neon Console](https://console.neon.tech/)
2. Create new project: `fynd-reviews`
3. Copy connection string from dashboard

### Option C: Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create new project
3. Go to Settings → Database
4. Copy "Connection string" (URI format)

---

## 2. Backend Deployment (Render)

### Step 1: Push Code to GitHub

```bash
cd Fynd_Take_Home
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Pranavsingh431/Fynd_Take_Home.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `fynd-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables:
   ```
   OPENROUTER_API_KEY=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
   DATABASE_URL=<your_postgres_connection_string>
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-user-app.vercel.app,https://your-admin-app.vercel.app
   ```

6. Click "Create Web Service"
7. Wait for deployment (3-5 minutes)
8. Copy the deployment URL (e.g., `https://fynd-backend.onrender.com`)

### Step 3: Verify Backend

Visit: `https://fynd-backend.onrender.com/health`

Should return:
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "api": "running"
  }
}
```

---

## 3. User Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Project Name**: `fynd-user-dashboard`
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend-user`
   - **Build Command**: (leave default)
   - **Output Directory**: (leave default)

5. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://fynd-backend.onrender.com
   ```

6. Click "Deploy"
7. Wait for deployment (2-3 minutes)
8. Copy the deployment URL (e.g., `https://fynd-user-dashboard.vercel.app`)

### Step 2: Update Backend CORS

1. Go back to Render dashboard
2. Update `ALLOWED_ORIGINS` environment variable to include your Vercel URL:
   ```
   ALLOWED_ORIGINS=https://fynd-user-dashboard.vercel.app,https://fynd-admin-dashboard.vercel.app
   ```
3. Save and wait for backend to redeploy

---

## 4. Admin Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. In Vercel Dashboard, click "Add New..." → "Project"
2. Import the same GitHub repository
3. Configure:
   - **Project Name**: `fynd-admin-dashboard`
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend-admin`
   - **Build Command**: (leave default)
   - **Output Directory**: (leave default)

4. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://fynd-backend.onrender.com
   ```

5. Click "Deploy"
6. Copy the deployment URL

---

## 5. Final Verification

### Test User Dashboard
1. Visit your user dashboard URL
2. Submit a test review with 5 stars
3. Verify you receive an AI-generated response

### Test Admin Dashboard
1. Visit your admin dashboard URL
2. Verify the review appears in the table
3. Check that AI summary and recommended action are displayed
4. Test filtering by clicking different rating cards

### Test API Directly
```bash
# Health check
curl https://fynd-backend.onrender.com/health

# Submit review
curl -X POST https://fynd-backend.onrender.com/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "review": "Great service!"}'

# Get all reviews
curl https://fynd-backend.onrender.com/api/reviews
```

---

## 6. Update README with Deployment URLs

Edit `Fynd_Take_Home/README.md` and update the "Deployed URLs" section:

```markdown
### Deployed URLs
- **User Dashboard**: https://your-user-dashboard.vercel.app
- **Admin Dashboard**: https://your-admin-dashboard.vercel.app
- **Backend API**: https://your-backend.onrender.com
```

---

## Troubleshooting

### Backend Issues

**Database Connection Error:**
- Verify `DATABASE_URL` is correct
- Check database is running (Render/Neon dashboard)
- Ensure IP whitelisting is disabled (or add Render IPs)

**LLM API Error:**
- Verify `OPENROUTER_API_KEY` is correct
- Check API key has credits at https://openrouter.ai/

**CORS Error:**
- Ensure `ALLOWED_ORIGINS` includes your frontend URLs
- Clear browser cache and try again

### Frontend Issues

**API Connection Error:**
- Verify `NEXT_PUBLIC_API_URL` points to correct backend
- Check backend `/health` endpoint is accessible
- Verify CORS is configured correctly

**Build Errors:**
- Check all dependencies are in `package.json`
- Verify TypeScript has no errors locally
- Check Vercel build logs for specific errors

### Database Issues

**Table doesn't exist:**
- The backend automatically creates tables on startup
- Check Render logs to verify database initialization
- Manually connect and run schema if needed

---

## Monitoring

### Backend Logs (Render)
1. Go to Render dashboard
2. Click on your web service
3. Click "Logs" tab
4. Monitor for errors

### Frontend Logs (Vercel)
1. Go to Vercel dashboard
2. Click on your project
3. Click on deployment
4. View "Functions" logs for API errors

### Database Monitoring (Render)
1. Go to Render dashboard
2. Click on your database
3. View "Metrics" for connection count, storage

---

## Cost Estimate

- **Render (Backend)**: Free tier (sleeps after inactivity)
- **Render (PostgreSQL)**: Free tier (1GB storage, 90-day expiry)
- **Vercel (Frontends)**: Free tier (100GB bandwidth/month)
- **OpenRouter API**: Pay-per-use (~$0.002 per request with GPT-3.5-turbo)

**Total for demo/assignment: $0-2**

---

## Production Checklist

Before going to production, consider:

- [ ] Add authentication (NextAuth.js)
- [ ] Implement rate limiting
- [ ] Add request logging and monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Upgrade to paid database plan (persistence)
- [ ] Add database backups
- [ ] Implement caching (Redis)
- [ ] Add API documentation (Swagger)
- [ ] Set up CI/CD pipeline
- [ ] Configure custom domain
- [ ] Enable HTTPS everywhere
- [ ] Add content security policy headers

---

## Support

For issues:
1. Check Render/Vercel logs
2. Verify all environment variables
3. Test API endpoints with curl
4. Review GitHub repo README files


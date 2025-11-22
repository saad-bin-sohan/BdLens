# BdLens Deployment Guide

This guide covers deploying BdLens on free-tier services.

## Prerequisites

1. **Google Gemini API Key** (free tier)
   - Visit https://makersuite.google.com/app/apikey
   - Create a new API key
   - Keep it secure for environment configuration

2. **GitHub Repository**
   - Push your BdLens code to GitHub
   - Both Render and Vercel can deploy directly from GitHub

## Backend Deployment (Render)

### Step 1: Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `BdLens-db`
   - Database: `BdLens`
   - User: `BdLens`
   - Region: Choose closest to you
   - Plan: **Free**
4. Click "Create Database"
5. Wait for database to be created
6. Copy the "Internal Database URL"

### Step 2: Enable pgvector Extension

After database creation:

1. Go to database dashboard
2. Click "Connect" → "External Connection"
3. Use psql or any PostgreSQL client to connect
4. Run: `CREATE EXTENSION vector;`

Or via Render shell:
```bash
# In database shell
CREATE EXTENSION vector;
```

### Step 3: Deploy Backend Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `BdLens-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: **Free**

4. Add Environment Variables:
   - `DATABASE_URL`: Paste Internal Database URL from Step 1
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `JWT_SECRET`: Generate a random string (e.g., `openssl rand -hex 32`)
   - `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app,http://localhost:3000`
   - `ENVIRONMENT`: `production`

5. Click "Create Web Service"
6. Wait for deployment (first deploy may take 5-10 minutes)
7. Note your backend URL: `https://BdLens-backend.onrender.com`

### Important Notes for Render Free Tier

- Service spins down after 15 minutes of inactivity
- First request after spin-down will be slow (30-60 seconds)
- Database has 1GB storage limit
- 100 compute hours per month

## Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variable:
   - `NEXT_PUBLIC_API_BASE_URL`: Your Render backend URL (e.g., `https://BdLens-backend.onrender.com`)

6. Click "Deploy"
7. Wait for deployment (2-3 minutes)
8. Your frontend will be live at `https://your-project.vercel.app`

### Step 2: Update Backend CORS

1. Go back to Render backend dashboard
2. Update `ALLOWED_ORIGINS` environment variable
3. Add your Vercel URL: `https://your-project.vercel.app,http://localhost:3000`
4. Service will automatically redeploy

## Post-Deployment Setup

### Create First Admin User

1. Visit your frontend: `https://your-project.vercel.app`
2. Click "Register" and create an account
3. Connect to your PostgreSQL database
4. Run SQL:
```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

### Verify Deployment

1. Login to your account
2. Go to Admin → Sources
3. Create a test source
4. Try uploading a PDF
5. Test semantic search

## Alternative: Docker Deployment

If you prefer Docker:

### Backend (Docker)

```bash
cd backend

# Build
docker build -t BdLens-backend .

# Run
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://..." \
  -e GEMINI_API_KEY="..." \
  -e JWT_SECRET="..." \
  -e ALLOWED_ORIGINS="https://your-frontend.vercel.app" \
  BdLens-backend
```

### Frontend (Docker)

```bash
cd frontend

# Build
docker build -t BdLens-frontend \
  --build-arg NEXT_PUBLIC_API_BASE_URL="https://your-backend.onrender.com" .

# Run
docker run -p 3000:3000 BdLens-frontend
```

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Verify pgvector extension is installed
- Check logs in Render dashboard

### Frontend can't connect to backend
- Verify NEXT_PUBLIC_API_BASE_URL is correct
- Check CORS settings in backend
- Ensure backend is not spun down (make a test request)

### Database connection errors
- Verify database is running
- Check connection string format
- Ensure pgvector extension is installed

### Gemini API errors
- Verify API key is valid
- Check you're within free tier limits
- Rate limiting: Adjust RATE_LIMIT_DELAY in ai_provider.py

## Monitoring

### Render
- View logs in Render dashboard
- Check metrics for uptime
- Monitor database storage usage

### Vercel
- View deployment logs
- Check Analytics tab for usage
- Monitor build times

## Cost Optimization

### Free Tier Limits

**Render:**
- Web Service: 750 hours/month
- Database: 1GB storage
- Spins down after 15 min inactivity

**Vercel:**
- 100GB bandwidth/month
- Unlimited deployments

**Gemini API:**
- 60 requests per minute (free tier)
- Rate limiting in code prevents hitting limits

### Tips
1. Don't over-crawl sources
2. Limit documents per crawl (default: 10)
3. Monitor database size
4. Keep backend warm with scheduled pings (optional)

## Security Notes

1. Never commit .env files
2. Use environment variables for all secrets
3. Keep JWT_SECRET secure
4. Enable HTTPS (automatic on Render/Vercel)
5. Review CORS settings regularly

## Backup

### Database Backup (Render)

1. Go to database dashboard
2. Click "Backups" tab
3. Free tier: Manual backups only
4. Download backups regularly

### Code Backup

- Keep code in GitHub
- Tag releases
- Document major changes

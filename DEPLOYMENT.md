# 🚀 Deployment Guide for JuryX

## Backend Setup for Vercel Deployment

The backend requires proper environment variables to be configured in Vercel. Follow these steps:

### 1. Required Environment Variables

You need to set these environment variables in your Vercel project:

#### Database Configuration
- **`DATABASE_URL`** (Required)
  - Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require`
  - Example: `postgresql://user:password@db.example.com:5432/juryx?sslmode=require`
  - **Where to get it:**
    - **Vercel Postgres**: Go to your Vercel project → Storage → Create Postgres → Copy connection string
    - **Supabase**: Project Settings → Database → Connection string
    - **Railway/Neon/Other**: Check your database provider's connection string

#### Optional Environment Variables (for file uploads)
- **`AWS_S3_BUCKET_NAME`** - AWS S3 bucket name (if using AWS)
- **`AWS_REGION`** - AWS region (if using AWS)
- **`AWS_ACCESS_KEY_ID`** - AWS access key (if using AWS)
- **`AWS_SECRET_ACCESS_KEY`** - AWS secret key (if using AWS)
- **`BLOB_READ_WRITE_TOKEN`** - Vercel Blob storage token (auto-set if using Vercel Blob)

### 2. Setting Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `juryx`
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:
   - `DATABASE_URL` = `your-production-database-url`
   - (Add other variables as needed)
5. Make sure to select **Production**, **Preview**, and **Development** environments
6. Click **Save**

### 3. Run Database Migrations

After setting up the database, you need to run migrations:

```bash
# Option 1: Using Vercel CLI (recommended)
npx vercel env pull .env.local  # Pull environment variables
npx prisma migrate deploy

# Option 2: Using Vercel Dashboard
# Go to your project → Deployments → Click on latest deployment → View Function Logs
# Or use Vercel's built-in database migration feature
```

### 4. Verify Database Connection

After deployment, check the logs:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check the **Function Logs** for any database connection errors

### 5. Quick Setup with Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Click on **Storage** tab
3. Click **Create Database** → Select **Postgres**
4. Name it (e.g., `juryx-db`)
5. Vercel will automatically:
   - Create the database
   - Set `DATABASE_URL` environment variable
   - Provide connection pooling
6. Run migrations:
   ```bash
   npx vercel env pull .env.local
   npx prisma migrate deploy
   ```

### 6. Troubleshooting

#### Backend API Routes Not Working

**Symptoms:**
- Frontend loads but API calls fail
- 500 errors on `/api/*` routes
- Database connection errors in logs

**Solutions:**

1. **Check Environment Variables:**
   ```bash
   npx vercel env ls
   ```
   Make sure `DATABASE_URL` is set

2. **Verify Database URL Format:**
   - Should start with `postgresql://` or `postgres://`
   - Should include SSL mode: `?sslmode=require` (for production)
   - Example: `postgresql://user:pass@host:5432/dbname?sslmode=require`

3. **Check Database Accessibility:**
   - Ensure your database allows connections from Vercel IPs
   - Some providers require IP whitelisting
   - Vercel uses dynamic IPs, so use connection pooling or allow all IPs

4. **Run Migrations:**
   ```bash
   npx prisma migrate deploy
   ```

5. **Check Prisma Client:**
   ```bash
   npx prisma generate
   ```

#### Common Errors

**Error: `Can't reach database server`**
- Database URL is incorrect
- Database is not accessible from Vercel
- Firewall/IP restrictions

**Error: `P1001: Can't reach database server`**
- Check DATABASE_URL format
- Verify database is running
- Check network connectivity

**Error: `P1003: Database does not exist`**
- Database name in URL is incorrect
- Database hasn't been created

**Error: `P1017: Server has closed the connection`**
- Connection pool exhausted
- Use connection pooling URL (if available)
- Check database connection limits

### 7. Testing After Deployment

1. **Test API Endpoints:**
   ```bash
   curl https://your-vercel-url.vercel.app/api/login
   ```

2. **Check Health:**
   - Visit: `https://your-vercel-url.vercel.app/api/auth/session`
   - Should return JSON response (not error)

3. **Test Database Connection:**
   - Try logging in or creating a team
   - Check Vercel function logs for errors

### 8. Production Database Recommendations

- **Vercel Postgres**: Best integration, automatic setup
- **Supabase**: Free tier available, good for development
- **Neon**: Serverless Postgres, good performance
- **Railway**: Easy setup, good for small projects
- **AWS RDS**: Enterprise-grade, more complex setup

### 9. Next Steps After Setup

1. ✅ Set `DATABASE_URL` in Vercel
2. ✅ Run `npx prisma migrate deploy`
3. ✅ Test API endpoints
4. ✅ Verify file uploads work (if configured)
5. ✅ Test authentication flow
6. ✅ Test team creation/joining

---

**Need Help?** Check Vercel logs or Prisma documentation: https://www.prisma.io/docs

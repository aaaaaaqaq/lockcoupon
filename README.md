# BonPlan.ma — Coupon Website

Next.js 14 + Supabase + Tailwind CSS

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
- Create a project at [supabase.com](https://supabase.com)
- Go to SQL Editor and run `supabase-schema.sql`
- Copy your project URL and anon key to `.env.local`

### 3. Run locally
```bash
npm run dev
```

### 4. Deploy to Vercel
```bash
npx vercel --prod
```
Set environment variables in Vercel dashboard.

## Hostinger VPS Deployment

```bash
# 1. Clone and install
git clone <your-repo> bonplan && cd bonplan && npm install

# 2. Build
npm run build

# 3. Start with PM2
npx pm2 start npm --name "bonplan" -- start
```

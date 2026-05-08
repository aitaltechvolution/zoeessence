# Zoe Essence — Vercel Deployment Guide

## What changed from the original

The project was originally built for **Lovable Cloud + Cloudflare Workers**.  
It has been reconfigured to deploy on **Vercel** (or any Node-compatible host):

| Before | After |
|---|---|
| `@lovable.dev/vite-tanstack-config` | Standard `vite` + `@vitejs/plugin-react` |
| `@cloudflare/vite-plugin` | Removed |
| `wrangler.jsonc` (Cloudflare Workers) | Removed |
| `bunfig.toml` | Removed |
| `vite.config.ts` wrapping Lovable's config | Plain Vite config with `target: "vercel"` |
| No `.env.example` | `.env.example` added with all required vars |

---

## Deploy to Vercel (recommended)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/zoe-essence.git
git push -u origin main
```

### 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects the framework — leave **Framework Preset** as `Other`
4. Set the following:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.vercel/output` *(auto-detected)*
   - **Install Command**: `npm install`

### 3. Add environment variables

In **Project → Settings → Environment Variables**, add every variable from `.env.example`:

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API → anon/public |
| `VITE_SUPABASE_URL` | Same as `SUPABASE_URL` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Same as `SUPABASE_PUBLISHABLE_KEY` |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ref ID |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role ⚠️ secret |
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) |

> ⚠️ **`SUPABASE_SERVICE_ROLE_KEY`** bypasses Row Level Security. Mark it as a **Server** variable only in Vercel — never expose it to the browser.

### 4. Deploy

Click **Deploy**. Vercel runs `npm install && npm run build` and your app goes live.

---

## Local development

```bash
npm install
cp .env.example .env          # fill in your real values
npm run dev
```

---

## Supabase configuration

### Auth redirect URLs

After deploying, add your Vercel URL to Supabase allowed redirect URLs:

1. Supabase → Authentication → URL Configuration
2. **Site URL**: `https://your-app.vercel.app`
3. **Redirect URLs**: add `https://your-app.vercel.app/**`

### Email sender (Resend)

The app sends order confirmation and password-reset emails via [Resend](https://resend.com).  
Currently configured with `onboarding@resend.dev` (Resend's shared sandbox — lands in spam).

To get inbox delivery:
1. Verify your domain in Resend
2. In `src/server/order-email.functions.ts`, update:
   ```ts
   const FROM = "Zoe Essence <orders@yourdomain.com>";
   ```

---

## Alternative hosting (Railway, Render, Fly.io)

This build outputs a standard Node.js server. For non-Vercel hosts:

```bash
npm run build
node .output/server/index.mjs   # or whatever the output entry is
```

Set the same environment variables on your host's dashboard.

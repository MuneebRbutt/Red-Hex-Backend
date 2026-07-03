# RED HEX INDUSTRIES — Deployment Guide

Deploy the **Next.js storefront** to **Vercel** and the **Vendure backend** to **Render** or **Railway**, with **PostgreSQL** in production.

| Component | Platform | URL example |
|-----------|----------|-------------|
| Storefront (Next.js 14) | Vercel | `https://redhex.vercel.app` |
| Vendure API (server + worker) | Render or Railway | `https://redhex-api.onrender.com` |
| Database | Render PostgreSQL / Railway PostgreSQL | (internal connection string) |

**Architecture:** Browser → Vercel storefront → Vendure Shop/Admin API → PostgreSQL

---

## Before you start

- [ ] Production builds pass locally:
  ```bash
  # Backend (repo root)
  npm install && npm run build

  # Storefront
  cd storefront && npm install && npm run build
  ```
- [ ] Choose hosting: **Render** (simpler single-service setup) or **Railway** (recommended — separate server + worker, persistent volumes).
- [ ] Decide on Git layout (see [Repository setup](#repository-setup)).

---

## Repository setup

You can use **one monorepo** or **two separate GitHub repos**.

### Option A — Monorepo (current layout)

```
vendure-backend/          ← Vendure backend (repo root)
├── src/
├── package.json
└── storefront/           ← Next.js frontend
    ├── app/
    └── package.json
```

- **Vercel:** set **Root Directory** to `storefront`
- **Render / Railway:** deploy from repo **root** (not `storefront/`)

### Option B — Two separate repos (recommended for production)

**Backend repo** — push everything **except** `storefront/`:

```
redhex-vendure-backend/
├── src/
├── static/
├── package.json
├── railway.toml
└── railway.worker.toml
```

**Frontend repo** — push only the storefront:

```
redhex-storefront/
├── app/
├── components/
├── package.json
└── next.config.mjs
```

Quick split from this monorepo (run once locally):

```bash
# Backend repo
git init redhex-backend && cd redhex-backend
# copy all root files except storefront/, then git add . && git commit

# Frontend repo
git init redhex-storefront && cd redhex-storefront
# copy storefront/* to root, then git add . && git commit
```

Push each repo to GitHub, then connect to Vercel / Render / Railway.

---

# Frontend deployment (Vercel)

## 1. Push to GitHub

Push the Next.js app (monorepo `storefront/` folder or standalone frontend repo).

## 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. If using a **monorepo**, set **Root Directory** → `storefront`

## 3. Framework & build settings

| Setting | Value |
|---------|-------|
| Framework Preset | **Next.js** (auto-detected) |
| Build Command | `npm run build` |
| Output Directory | *(leave default — Vercel manages `.next` automatically)* |
| Install Command | `npm install` |
| Node.js Version | 20.x (recommended) |

> Do **not** manually set Output Directory to `.next` unless Vercel asks — the Next.js preset handles this.

## 4. Environment variables

In **Project → Settings → Environment Variables**, add:

| Variable | Example | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_VENDURE_SHOP_API` | `https://your-backend.onrender.com/shop-api` | Yes |
| `NEXT_PUBLIC_VENDURE_ADMIN_API` | `https://your-backend.onrender.com/admin-api` | Yes |

Use your live backend URL (Render, Railway, or custom domain). **No trailing slash.**

Copy from `storefront/.env.example`:

```env
NEXT_PUBLIC_VENDURE_SHOP_API=https://your-backend.onrender.com/shop-api
NEXT_PUBLIC_VENDURE_ADMIN_API=https://your-backend.onrender.com/admin-api
```

## 5. Deploy

1. Click **Deploy**
2. Wait for the build to finish
3. Note your live URL, e.g. `https://redhex-industries.vercel.app`

## 6. Verify frontend

- [ ] Homepage loads: `https://your-site.vercel.app`
- [ ] Collections page shows categories (after backend seeds)
- [ ] Admin login: `https://your-site.vercel.app/admin/login`
- [ ] Product images load (backend `PUBLIC_URL` + asset config must be correct)

---

# Backend deployment

The backend is already configured for PostgreSQL when `DATABASE_URL` is set (`src/get-db-config.ts`). Local dev still uses SQLite when `DATABASE_URL` is unset.

**Vendure requires two processes in production:**

| Process | Role |
|---------|------|
| **Server** | GraphQL APIs (`/shop-api`, `/admin-api`), HTTP |
| **Worker** | Background jobs (search index, collection updates, etc.) |

---

## Option 1 — Render (free tier)

Render can run server + worker in **one Web Service** using `npm start` (uses `concurrently`). Good for getting started; free tier sleeps after inactivity.

### 1. Push backend to GitHub

Push the Vendure backend repo (not the Next.js storefront).

### 2. Create PostgreSQL on Render

1. [dashboard.render.com](https://dashboard.render.com) → **New → PostgreSQL**
2. Copy the **Internal Database URL** (use internal URL from the web service)
3. Note: free PostgreSQL expires after 90 days on Render — upgrade or migrate for long-term production

### 3. Create Web Service

1. **New → Web Service** → connect your backend GitHub repo
2. Settings:

| Setting | Value |
|---------|-------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/shop-api` (optional) |

### 4. Environment variables (Render)

Add in **Environment**:

```env
APP_ENV=prod
PORT=3000

COOKIE_SECRET=<long-random-string-min-32-chars>
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=<strong-password>

DATABASE_URL=<from Render PostgreSQL — Internal URL>
DATABASE_SSL=true

# First deploy only — creates tables. Remove after successful deploy.
DB_SYNCHRONIZE=true

PUBLIC_URL=https://your-service.onrender.com
STOREFRONT_URL=https://your-site.vercel.app
```

Optional (persistent uploads on Render — use a **Disk** mount):

```env
ASSET_UPLOAD_DIR=/opt/render/project/src/static/assets
```

Attach a Render Disk and mount it at that path if you need uploads to survive redeploys.

### 5. Database setup (first deploy)

1. Deploy the service with `DB_SYNCHRONIZE=true`
2. Confirm the service starts and `/shop-api` responds
3. **Remove** `DB_SYNCHRONIZE` (or set to `false`) and redeploy
4. Run seeds via Render **Shell** (or locally against production `DATABASE_URL`):

```bash
npm run seed:collections
npm run seed:channel-config
```

### 6. Migrations (ongoing schema changes)

```bash
npm run migrate
```

On deploy, migrations also run automatically if you use:

```bash
npm run start:server:prod
```

instead of `npm start` for the **server only**. On Render with `npm start`, both server and worker start together; for migration-on-boot, temporarily set Start Command to `npm run start:server:prod` for the first deploy, then switch back — or run `npm run railway:migrate` manually in Shell after `npm run build`.

---

## Option 2 — Railway (recommended)

Railway supports **two services** (server + worker) and **volumes** for asset storage. Config files are included in this repo.

### 1. Push backend to GitHub

Same backend repo as above.

### 2. Create Railway project

1. [railway.app](https://railway.app) → **New Project**
2. **Add PostgreSQL** — Railway injects `DATABASE_URL` automatically
3. **Add Service** → deploy from GitHub (backend repo)

### 3. Server service

Uses `railway.toml` in repo root:

- **Build:** `npm run build`
- **Start:** `npm run start:server:prod` (runs migrations, then server)

Environment variables (see `.env.example`):

```env
APP_ENV=prod
COOKIE_SECRET=<long-random-string>
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=<strong-password>

DATABASE_SSL=true
DB_SYNCHRONIZE=true

PUBLIC_URL=https://<your-server>.up.railway.app
STOREFRONT_URL=https://your-site.vercel.app
ASSET_UPLOAD_DIR=/data/assets
```

**Persistent assets:** add a **Volume**, mount at `/data`, set `ASSET_UPLOAD_DIR=/data/assets`.

After first successful deploy, remove `DB_SYNCHRONIZE` and redeploy.

### 4. Worker service

Add a **second service** from the **same repo**:

- Set config file path to `railway.worker.toml`, or set Start Command: `npm run start:worker`
- Copy **all the same env vars** as the server (especially `DATABASE_URL`, `COOKIE_SECRET`, `APP_ENV`)

### 5. Seeds (Railway shell)

```bash
npm run seed:collections
npm run seed:channel-config
```

### 6. Migrations

```bash
npm run railway:migrate
# or
npm run migrate
```

---

# Connect frontend to backend

After the backend is live:

1. Open **Vercel → Project → Settings → Environment Variables**
2. Update:

```env
NEXT_PUBLIC_VENDURE_SHOP_API=https://<BACKEND_URL>/shop-api
NEXT_PUBLIC_VENDURE_ADMIN_API=https://<BACKEND_URL>/admin-api
```

3. **Redeploy** the Vercel project (Deployments → ⋯ → Redeploy)

4. On the backend, ensure `STOREFRONT_URL` matches your Vercel URL (CORS).

---

# End-to-end test checklist

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Vercel storefront URL | Homepage loads |
| 2 | Visit `/collections/sportswear` (or any category) | Products or empty grid (no CORS errors in browser console) |
| 3 | Visit `/admin/login` | Login form loads |
| 4 | Log in with `SUPERADMIN_USERNAME` / `SUPERADMIN_PASSWORD` | Redirect to admin dashboard |
| 5 | Add a test product in admin | Saves without error |
| 6 | View product on storefront | Appears under correct category |
| 7 | Upload product image | Image URL uses `PUBLIC_URL/assets/...` |
| 8 | Submit contact form | No 500 error |

**API smoke test** (replace URL):

```bash
curl -s -o /dev/null -w "%{http_code}" https://your-backend.onrender.com/shop-api
# Expect: 400 or 200 (not 502/503)
```

---

# Environment variable reference

## Vercel (frontend)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_VENDURE_SHOP_API` | Shop GraphQL endpoint |
| `NEXT_PUBLIC_VENDURE_ADMIN_API` | Admin GraphQL endpoint (used by `/api/admin/*` routes) |

## Render / Railway (backend)

| Variable | Description |
|----------|-------------|
| `APP_ENV` | Set to `prod` in production |
| `PORT` | `3000` (Render/Railway may override via `PORT`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `DATABASE_SSL` | `true` for cloud Postgres (default) |
| `DB_SYNCHRONIZE` | `true` **only on first deploy**, then remove |
| `COOKIE_SECRET` | Random secret for session cookies |
| `SUPERADMIN_USERNAME` | Admin login username |
| `SUPERADMIN_PASSWORD` | Admin login password |
| `PUBLIC_URL` | Public backend URL (assets, API links) |
| `STOREFRONT_URL` | Vercel URL (CORS + email templates) |
| `ASSET_UPLOAD_DIR` | Persistent path for uploaded images |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Optional — production email |

---

# Local development (unchanged)

```powershell
# Terminal 1 — Vendure server
cd E:\vendure-backend
npm run dev:server

# Terminal 2 — Vendure worker
npm run dev:worker

# Terminal 3 — Storefront
cd E:\vendure-backend\storefront
npm run dev
```

- Storefront: http://localhost:3001  
- Vendure API: http://localhost:3000  
- Admin: http://localhost:3001/admin/login  

Local dev uses **SQLite** (`vendure.sqlite`) when `DATABASE_URL` is not set.

---

# Adding products in production

After deployment and seeds:

1. Log in at `https://your-site.vercel.app/admin/login`
2. Add categories/products via the custom admin
3. Do **not** rely on local SQLite data — production data lives in PostgreSQL on Render/Railway

For bulk import (~100 products), add them on the **production** backend after deploy.

---

# Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS error in browser | Set `STOREFRONT_URL` on backend to exact Vercel URL; redeploy backend |
| Admin login: "Unexpected end of JSON" | Backend not running or wrong `NEXT_PUBLIC_VENDURE_ADMIN_API` |
| `database does not exist` / connection refused | Check `DATABASE_URL`; use internal URL on Render |
| Tables missing on first deploy | Set `DB_SYNCHRONIZE=true`, deploy, then remove |
| Products not in categories | Ensure **worker** is running; run seeds |
| Images 404 after redeploy | Mount persistent disk (Render) or Railway volume; set `ASSET_UPLOAD_DIR` |
| Tax zone error | Run `npm run seed:channel-config` on production DB |
| Render service sleeping | Free tier — first request may take 30–60s |

---

# Quick command reference

```bash
# Build
npm run build                    # backend (TypeScript → dist/)
cd storefront && npm run build   # frontend (Next.js)

# Production start (backend)
npm run start:server:prod        # server + migrations
npm run start:worker             # worker only
npm start                        # server + worker (Render)

# Database
npm run migrate                  # run migrations
npm run seed:collections         # category tree
npm run seed:channel-config      # tax zone + channel defaults
```

---

**RED HEX INDUSTRIES** — Vercel (frontend) + Render or Railway (backend) + PostgreSQL

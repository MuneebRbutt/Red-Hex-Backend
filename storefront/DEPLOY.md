# RED HEX INDUSTRIES — Frontend Deployment (Vercel)

This is the **Next.js storefront** deploy guide. For the Vendure backend (Render/Railway + PostgreSQL), see the main guide: [../DEPLOY.md](../DEPLOY.md).

---

## 1. Push to GitHub

Push this app to GitHub:

- **Monorepo:** push the whole repo; set Vercel **Root Directory** to `storefront`
- **Standalone repo:** push only the contents of `storefront/` to the repo root

## 2. Connect to Vercel

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. **Root Directory:** `storefront` (if monorepo) or `.` (if standalone frontend repo)

## 3. Build settings

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | *(default — leave empty)* |
| Install Command | `npm install` |

## 4. Environment variables

**Settings → Environment Variables:**

```env
NEXT_PUBLIC_VENDURE_SHOP_API=https://your-backend.onrender.com/shop-api
NEXT_PUBLIC_VENDURE_ADMIN_API=https://your-backend.onrender.com/admin-api
```

Replace with your live Render or Railway backend URL. No trailing slash.

See `.env.example` in this folder.

## 5. Deploy

Click **Deploy**. Note your live URL, e.g. `https://redhex-industries.vercel.app`.

## 6. Verify

- [ ] Homepage loads
- [ ] `/collections/*` pages work (no CORS errors in DevTools → Console)
- [ ] `/admin/login` works with production superadmin credentials
- [ ] After adding a product in admin, it appears on the storefront

## 7. After backend is deployed

Update env vars with the real backend URL and **Redeploy** on Vercel.

Set `STOREFRONT_URL` on the backend to your Vercel URL so CORS allows requests.

---

Full stack guide: [../DEPLOY.md](../DEPLOY.md)

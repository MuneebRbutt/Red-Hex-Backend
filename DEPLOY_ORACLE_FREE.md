# Tanaura deployment: Vercel + Oracle Always Free

This is the recommended no-monthly-cost setup for this Vendure backend. Keep the Next.js storefront on Vercel and run the backend, worker, PostgreSQL database, and product-image storage on one Oracle Always Free Ubuntu VM.

Koyeb's free instance is not appropriate for this project: it scales to zero, cannot use a persistent volume, and its free database has only limited monthly active time. Vercel and Netlify serverless functions are also not a fit because this is a Vendure application, not a small Express/FastAPI API.

## 1. Prepare DNS and the VM

1. Create an Oracle Cloud **Always Free** Ubuntu VM (ARM Ampere or the free AMD shape).
2. Give the VM a public IP and open its Oracle network security rules for TCP **80** and **443**.
3. Create an `A` DNS record such as `api.example.com` pointing to that public IP. Wait until it resolves before starting Caddy; it will obtain the HTTPS certificate automatically.
4. SSH to the VM and install Docker:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
exit
```

Sign in again, then clone the backend repository:

```bash
git clone https://github.com/MuneebRbutt/Red-Hex-Backend.git tanaura-backend
cd tanaura-backend
cp .env.oracle.example .env
chmod 600 .env
```

Edit `.env` and set the real API domain, Vercel storefront URL, CORS origins, database password, cookie secret, and admin password. Generate secrets with `openssl rand -hex 32`.

If Ubuntu Firewall is enabled, also allow the web ports:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## 2. First backend deployment

With `DB_SYNCHRONIZE=true` in `.env`, build and start the database, API, and HTTPS proxy:

```bash
docker compose --env-file .env -f docker-compose.oracle.yml up -d --build db backend caddy
docker compose --env-file .env -f docker-compose.oracle.yml logs -f backend caddy
```

When the server is healthy, edit `.env`, change `DB_SYNCHRONIZE=false`, then start the worker and apply the new setting:

```bash
docker compose --env-file .env -f docker-compose.oracle.yml up -d
```

The Compose volumes retain both PostgreSQL data and uploaded images through application updates. Do not run `docker compose down -v` on production, because that deletes those volumes.

## 3. Add the existing welding catalogue

The product images must be copied to the VM because they are intentionally not stored in Git. Copy `Welding Gloves.zip` from your PC to the server, then run:

```bash
mkdir -p imports/welding-gloves
unzip /path/to/Welding\ Gloves.zip -d imports/welding-gloves
docker compose --env-file .env -f docker-compose.oracle.yml run --rm \
  -e WELDING_GLOVE_IMAGE_DIRECTORY=/imports/welding-gloves \
  -v "$(pwd)/imports:/imports:ro" \
  backend node dist/import-welding-gloves.js
```

This importer is safe to repeat: it skips products that already exist. Verify at `https://api.example.com/shop-api` and in the storefront once Vercel is configured.

## 4. Configure the Vercel storefront

In Vercel, open the **storefront project** and set these Production environment variables:

```env
NEXT_PUBLIC_VENDURE_SHOP_API=https://api.example.com/shop-api
NEXT_PUBLIC_VENDURE_ADMIN_API=https://api.example.com/admin-api
```

Redeploy the Vercel project after saving them. These values are baked into the Next.js browser build, so changing them requires a redeploy.

The backend `.env` must contain the exact Vercel origin in both `STOREFRONT_URL` and `CORS_ORIGINS`, for example:

```env
STOREFRONT_URL=https://tanaura-gloves.vercel.app
CORS_ORIGINS=https://tanaura-gloves.vercel.app,https://www.example.com
```

If you attach a custom storefront domain, add that exact `https://...` domain to `CORS_ORIGINS` too, then restart the backend with the Compose command above.

## 5. Deploy later changes

From the VM repository:

```bash
git pull origin main
docker compose --env-file .env -f docker-compose.oracle.yml up -d --build
```

Push frontend changes to its frontend GitHub repository to trigger Vercel. Push backend changes to the backend repository, then run the two commands above on the VM. They are separate deployments.

## Checks

```bash
docker compose --env-file .env -f docker-compose.oracle.yml ps
curl -s -o /dev/null -w "%{http_code}\n" https://api.example.com/shop-api
```

Open the Vercel site and confirm its product requests return successfully in the browser Network panel. A GraphQL endpoint may reply `400` to a plain browser request; that confirms the API is reachable as long as it is not a `502`, `503`, or CORS failure.

# Tanaura Vercel-only deployment

This storefront contains its product catalogue and product images. It does not require the old Render/Vendure backend.

## Deploy

1. Push the `main` branch of this repository. The connected Vercel project will create a deployment automatically.
2. In Vercel, remove the old `NEXT_PUBLIC_VENDURE_SHOP_API` and `NEXT_PUBLIC_VENDURE_ADMIN_API` variables. They are no longer used.
3. Open the deployed site and verify `/collections/welding-gloves` and a product page such as `/products/black-contrast-stitch-welding-gloves`.

## Contact form

The contact form and product-enquiry form are Vercel serverless functions. To receive the submissions:

1. Create a free form at [Formspree](https://formspree.io/).
2. Copy the endpoint, for example `https://formspree.io/f/abcdwxyz`.
3. In Vercel, add `FORMSPREE_ENDPOINT` with that endpoint as an environment variable for Production.
4. Redeploy the project.

WhatsApp contact continues to work without any environment variable.

## Adding future products

Add an image under `public/products/` and a product record in `lib/mockProducts.ts`, then commit and push. Vercel will publish the update automatically.

# Deploy

This app is deployed as a static site to Cloudflare Pages at `workshop.arbrass.ca`.

## One-time Cloudflare setup

1. Open https://dash.cloudflare.com → **Workers & Pages** → **Start building** → **Pages** → **Connect to Git**.
2. Authorize GitHub when prompted. Pick the repo: `rthomassin/cms-etl-walkthrough`.
3. Configure build:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION=20`
4. **Save & Deploy**. The first build publishes to `https://<slug>.pages.dev`.

## Custom domain

1. Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter `workshop.arbrass.ca`.
3. Because `arbrass.ca` is already on Cloudflare DNS, the CNAME is created automatically. Propagation is usually < 1 minute.

## Every deploy

Push to `main`:

```bash
git push origin main
```

Cloudflare Pages automatically runs `npm run build` and publishes the result. Preview deploys run on feature branches.

## Rolling back

Pages project → **Deployments** → click any prior deployment → **Rollback to this deployment**.

# Multiple Lab

Reverse-engineer the assumptions embedded in an earnings multiple.

A fast, client-side valuation calculator for fundamental investors. Three model
levels (Simple growth, ROIC/Reinvestment, Shareholder Wealth) and three modes
(Justified Multiple, Implied Assumptions, Wealth IRR). All math runs in your
browser; assumptions persist via `localStorage`.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:5173.

## Build

```sh
npm run build      # outputs to dist/
npm run preview    # serves the built site
npm test           # vitest unit tests for the calculation engine
```

## Deploying to GitHub Pages

A workflow in `.github/workflows/deploy.yml` builds and publishes to Pages on
every push to `main`.

One-time setup:

1. Push this repo to GitHub.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. The workflow will publish the site at
   `https://<your-user>.github.io/<repo-name>/`.

The workflow sets `VITE_BASE` to `/<repo-name>/` at build time so asset paths
resolve correctly. If you rename the repo to `<your-user>.github.io` (a user
site), edit the workflow to set `VITE_BASE: /`.

## Deploying elsewhere

- **Vercel / Netlify / Cloudflare Pages**: import the repo, framework preset
  "Vite", build command `npm run build`, output dir `dist`. No env vars needed.

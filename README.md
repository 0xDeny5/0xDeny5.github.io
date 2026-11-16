# denys-rybkin-site

Personal website of Denys Rybkin — https://0xdeny5.github.io

React 19 + TypeScript + Vite. The page is prerendered to static HTML at build time with Node.js
(`scripts/prerender.js`) and hydrated in the browser, so crawlers and link previews see the full content.
Hosted on GitHub Pages; no server to run or pay for.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm check      # lint + typecheck + build + prerender
pnpm preview    # serve the production build from dist/
```

All copy lives in [`src/content.ts`](src/content.ts). Edit it there; components only render it.

## Deploy

The site is served from the root of `https://0xdeny5.github.io`, which requires the repository to be
named exactly `0xDeny5.github.io`.

1. Create a public repository named `0xDeny5.github.io` and push this folder to its `main` branch.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): lint, build, deploy.
   Pull requests only lint and build.

### Custom domain (optional)

Buy a domain, add it under **Settings → Pages → Custom domain**, then replace `https://0xdeny5.github.io/`
in `index.html`, `public/robots.txt` and `public/sitemap.xml`.

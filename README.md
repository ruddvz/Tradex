# Tradex

Static web shell deployed to **GitHub Pages** as a **Progressive Web App** so you can install it on the desktop (Chrome or Edge) and run it in its own window.

## Requirements

- Node.js **20 or newer** (matches GitHub Actions).

## Local development

```bash
npm install
npm run dev
```

Use the URL Vite prints (by default it includes the `/Tradex/` base path used for GitHub project Pages).

## Production build

```bash
npm run build
npm run preview
```

## GitHub Pages from Actions

1. On GitHub: **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Push to `main`. The workflow `.github/workflows/pages.yml` builds with `npm ci` / `npm run build` and publishes the `dist` folder.
4. After a successful run, open **`https://ruddvz.github.io/Tradex/`** (replace the owner if the repo is forked).

### Desktop PWA

1. Open the deployed site in **Chrome** or **Edge**.
2. Install: address bar **install** icon, or the browser menu → **Install Tradex** (wording varies slightly).
3. Launch from the app shortcut; the UI runs with `display: standalone` like a desktop app.

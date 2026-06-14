# Marketplace ERP

A Vite + React ERP dashboard for marketplace operations — inventory, orders, customers, and reports.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## GitHub Pages

This project is configured for GitHub Pages as a project site.

| Setting | Value |
|---------|-------|
| Base path | `/Marketplace-ERP/` |
| Build output | `dist/` |
| Deploy workflow | `.github/workflows/deploy.yml` |

### One-time GitHub setup

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` (or run the workflow manually) to deploy.

The site will be available at:

`https://<your-username>.github.io/Marketplace-ERP/`

### If your repo name differs

Update the base path in these places:

- `vite.config.ts` — `VITE_BASE_PATH` default
- `.github/workflows/deploy.yml` — `VITE_BASE_PATH` env var
- `package.json` — `preview` script `--base` flag

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production (includes SPA `404.html` for GitHub Pages) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Tech Stack

- [Vite](https://vite.dev/)
- [React 19](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [TypeScript](https://www.typescriptlang.org/)

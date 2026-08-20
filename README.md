# Vladimir Belsch Portfolio

Personal technical portfolio for `https://vbnovikov.github.io`.

The site is a static Vite + React + TypeScript single-page portfolio focused on solutions engineering, SaaS implementation, cloud infrastructure, integrations, and customer-facing technical delivery. Motion is handled with Framer Motion, the decorative hero topology uses React Force Graph 2D, and small link icons use Lucide React.

## Local Setup

```bash
npm install
npm run dev
```

Vite will print a local development URL, usually `http://localhost:5173`.

## Build

```bash
npm run build
```

The production output is written to `dist`.

## GitHub Pages Deployment

This repo includes `.github/workflows/deploy-pages.yml`, which deploys the `dist` build from `main` using GitHub Pages.

For `vbnovikov/vbnovikov.github.io`:

1. Push the site to the `main` branch.
2. In GitHub, open **Settings > Pages**.
3. Set **Source** to **GitHub Actions**.
4. Pushes to `main` will install dependencies, build the site, and publish to `https://vbnovikov.github.io`.

The Vite `base` is set to `/`, which matches a GitHub user site. If this is later deployed as a project page under a different repository name, update `base` in `vite.config.ts`.

## Content

Primary content lives in `src/App.tsx`:

- Navigation and hero copy
- About/profile paragraphs
- Selected project rows
- Capabilities
- Experience timeline
- Education and contact details

Visual styling lives in `src/styles.css`.

Portrait and education assets live in `public/images`.

## Updating Projects

Project rows are defined in the `projects` array in `src/App.tsx`. To add or edit a project, update its title, summary, GitHub URL, category, and tags there.

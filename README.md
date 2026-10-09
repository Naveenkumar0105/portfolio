# Naveenkumar Narsozhan — Portfolio

Editorial, single-page portfolio built with Vite, React, TypeScript, and Three.js.

## Local development

```sh
npm ci
npm run dev
```

Open `http://localhost:5173/portfolio/`. Run `npm run check` and `npm run build` before publishing.

## Editing

Portfolio copy lives in `src/data/projects.ts`, `experience.ts`, `skills.ts`, and `certs.ts`. Add verified repository links to the project entries marked `TODO`. The original profile, résumé, certificate images, and Snitch GLB remain in `assets/`; `public/assets` points there so Vite serves them at `/portfolio/assets/`.

## Deploy

The GitHub Actions workflow deploys the built site to GitHub Pages on pushes to `main`, once Pages is configured to use **GitHub Actions** as its source. The Vite base path is `/portfolio/`.

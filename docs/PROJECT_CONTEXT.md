# Portfolio project context

Last verified against the repository: 2026-10-27.

## Purpose

This repository contains Naveenkumar Narsozhan's editorial, single-page portfolio. It presents selected projects, experience, skills, education, certifications, contact details, and a downloadable resume. The visual identity combines an editorial layout with subtle Harry Potter-inspired details, including an interactive Golden Snitch and a recruiter-oriented “Quick Dossier.”

Production URL: `https://naveenkumar0105.github.io/portfolio/`

## Stack and shape

- Vite 7, React 19, and TypeScript 5.9.
- Three.js renders the interactive GLB figure in the hero.
- No router, server, API, state library, or CSS framework. The application is a single page rendered from `src/main.tsx`.
- Styling is kept in `src/style.css`, including light/dark themes, responsive layouts, motion preferences, dialogs, and Snitch interactions.
- Portfolio copy is mostly data-driven through `src/data/`.

## Source map

- `src/main.tsx` — application markup and behavior: theme persistence, navigation, all page sections, resume links, certificate preview, Snitch game, toast, Quick Dossier, keyboard focus management, and modal behavior.
- `src/Figure.tsx` — lazy-loaded Three.js hero scene. Loads the GLB model, applies pointer-driven head movement through shader modification, observes resizing, pauses useful rendering when inactive/hidden, and disposes WebGL resources on unmount.
- `src/style.css` — all site styling and responsive/reduced-motion rules.
- `src/data/site.ts` — identity, contact details, hero/contact copy, Dossier copy, and the three selected Dossier highlights.
- `src/data/projects.ts` — `Project` and `DossierHighlight` types plus project entries. Some project repository URLs intentionally remain marked `TODO` until verified.
- `src/data/experience.ts` — work experience and the Microchip Dossier highlight.
- `src/data/skills.ts` — skills and education entries.
- `src/data/certs.ts` — certifications, verification URLs, and certificate image filenames.
- `assets/` — resume, certificate images, profile imagery, and GLB models.
- `public/` — favicon, locally hosted fonts and licenses, robots file, sitemap, and the `public/assets -> ../assets` symlink.
- `tests/data.test.mjs` — small assertion-based checks for important project metrics, URLs, and Dossier highlight selection.
- `.github/workflows/deploy.yml` — GitHub Pages build and deployment on pushes to `main`.

## Page structure and interactions

The page order is hero, Work, Experience, Skills, Education, Certifications, and Contact/footer. The sticky navigation links to Work, Experience, Contact, and the local resume.

Important interactions:

- The theme toggle stores `light` or `dark` in `localStorage` and otherwise respects the system color scheme.
- The hero figure is lazy-loaded and activated near the viewport. Pointer movement controls its head; reduced-motion users receive a static presentation.
- Project rows use native `<details>` elements.
- Section headings and content rows reveal once as they enter the viewport; reduced-motion users receive content without entrance motion.
- Certificate thumbnails open an accessible image-preview dialog.
- Releasing and catching the Snitch opens the Quick Dossier; later catches show a toast. Dossier highlights link back to Work or Experience.
- Dialog logic locks background scrolling, handles Escape and Tab focus containment, and returns focus when closed.

Preserve keyboard access, focus restoration, reduced-motion behavior, and mobile layouts when changing these interactions.

## Content ownership

Prefer editing the corresponding module in `src/data/` for portfolio facts and repeated content rather than embedding new copy in JSX. Keep claims, metrics, employment dates, contact information, external links, and resume/certificate files consistent with verified source material.

The three Quick Dossier highlights are explicitly selected in `src/data/site.ts` from project and experience entries. Reordering either array can therefore change the Dossier and may require updating its assertions.

## Assets and URL rules

Vite's base path is `/portfolio/`. Runtime asset URLs in TypeScript use `import.meta.env.BASE_URL`; keep that pattern so local development and GitHub Pages both resolve assets correctly.

Files under `assets/` are exposed to Vite through the `public/assets` symlink. Do not replace the symlink with duplicated assets. The currently rendered hero model is `assets/naveen-portfolio.glb`; `assets/golden_snitch_detailed.glb` also exists but is not loaded by the current source.

## Commands

```sh
npm ci
npm run dev      # Vite dev server; site path is /portfolio/
npm run check    # TypeScript build plus data assertions
npm run build    # TypeScript build plus production Vite bundle
npm run preview  # Preview the production bundle
```

Run `npm run check` and `npm run build` before publishing. The deploy workflow uses Node 22, builds `dist`, and publishes it to GitHub Pages.

## Maintenance rule

Update this file only when a future chat would otherwise form an incorrect mental model of the repository. Keep descriptions at the architectural level; do not add a chronological change log or inventory every CSS selector and content entry.

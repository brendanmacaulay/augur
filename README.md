# Augur

An AI-native enterprise risk register — surface, score, and track exposure.

Augur lets teams capture risks, score them on a 5×5 likelihood × impact matrix,
visualise the portfolio on a severity heat map, and toggle between **inherent**
and **residual** exposure to see the effect of controls. New risks can be
drafted from a plain-English description by an AI assistant.

## Features

- **Risk register** — create, edit, and delete risks (Supabase-backed).
- **Heat map dashboard** — 5×5 matrix coloured by severity band, a live
  Critical/High/Moderate/Low summary strip, and click-to-filter cells.
- **Inherent vs residual toggle** — the whole dashboard re-scores against
  residual values (with per-axis fallback to inherent when not assessed).
- **Draft with AI** — describe a risk in plain English; an Anthropic-backed
  serverless function returns a structured, validated draft to review.
- **Sort & filter** the register by category, status, and severity band.
- **Light / dark mode** with system-preference default and persistence.

## Tech stack

- [Vite](https://vite.dev) + [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite`
- [Supabase](https://supabase.com) (`@supabase/supabase-js`)
- Anthropic Messages API via a Vercel serverless function

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable                  | Where it runs | Purpose                                   |
| ------------------------- | ------------- | ----------------------------------------- |
| `VITE_SUPABASE_URL`       | Browser       | Supabase project URL                      |
| `VITE_SUPABASE_ANON_KEY`  | Browser       | Supabase anon key                         |
| `ANTHROPIC_API_KEY`       | **Server**    | Anthropic key for `api/draft-risk` (never exposed to the client — no `VITE_` prefix) |

## Local development

```bash
npm install
npm run dev        # Vite dev server (UI only)
```

`npm run dev` does **not** serve the `/api` serverless function. To exercise the
"Draft with AI" feature locally, run the function alongside the UI with the
Vercel CLI:

```bash
npx vercel dev     # serves the UI and /api/draft-risk together
```

## Build & lint

```bash
npm run build      # production build to dist/
npm run lint
```

## Deploying to Vercel

1. Import the repository in Vercel. The framework preset (Vite) and the
   `api/` serverless function are detected automatically — no `vercel.json`
   needed.
2. Add all three environment variables above in the Vercel project settings
   (`ANTHROPIC_API_KEY` is server-side only).
3. Deploy. The static site is served from `dist/` and `POST /api/draft-risk`
   runs as a Node serverless function.

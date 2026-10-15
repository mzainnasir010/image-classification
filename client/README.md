# SceneSense — Frontend

A production-quality React + TypeScript frontend for the SceneSense image scene classifier. Upload a photo and classify it into one of six categories (buildings, forest, glacier, mountain, sea, street) using a fine-tuned ResNet50 with calibrated confidence and honest uncertainty detection.

## Screenshots

> _Add screenshots here after running the app._

## Tech Stack

| Category | Library |
|---|---|
| Framework | React 19 + TypeScript (strict) + Vite 6 |
| Styling | Tailwind CSS v4 with CSS-variable design tokens |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| HTTP | Custom fetch client (`src/api/client.ts`) |
| File upload | react-dropzone |
| Charts | Recharts |
| Icons | lucide-react |
| Font | Inter (self-hosted, `@fontsource-variable/inter`) |
| Testing | Vitest + React Testing Library + MSW |
| Linting | oxlint |

## Folder Structure

```
client/
├── index.html                    # Theme flash-prevention script, SEO meta
├── .env.example                  # All required variable names (committed)
├── .env.development              # Localhost values (committed)
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx                  # Entry: TanStack Query provider
    ├── App.tsx                   # Mounts AppRouter
    ├── routes.tsx                # All routes with lazy loading
    ├── index.css                 # Imports globals.css
    ├── styles/
    │   └── globals.css           # Design tokens (@theme), dark mode, utilities
    ├── config/
    │   ├── env.ts                # Zod-validated env — the only place that reads import.meta.env
    │   ├── links.ts              # External links from env
    │   └── nav.ts                # Dashboard nav items
    ├── api/
    │   ├── client.ts             # get / postForm — all HTTP lives here
    │   ├── endpoints.ts          # fetchHealth, fetchModelInfo, predict
    │   ├── types.ts              # TypeScript interfaces for all response shapes
    │   └── errors.ts             # ApiError class + apiErrorMessage mapper
    ├── hooks/
    │   ├── useHealth.ts          # TanStack Query health poll
    │   ├── useModelInfo.ts       # TanStack Query model info
    │   ├── usePredict.ts         # TanStack Mutation for /predict
    │   ├── useHistory.ts         # localStorage-backed session history
    │   └── useTheme.ts           # Light / dark / system theme
    ├── data/
    │   ├── classes.ts            # Six scene class descriptors + icons
    │   ├── faq.ts                # FAQ items
    │   ├── features.ts           # Feature cards for landing page
    │   └── modelMetrics.ts       # Static training metrics (F1, confusion matrix, etc.)
    ├── lib/
    │   ├── format.ts             # formatPercent, formatBytes, capitalizeLabel, formatMs
    │   ├── image.ts              # createThumbnail — downscale to base64 for history
    │   ├── validateFile.ts       # Client-side MIME + size check
    │   └── utils.ts              # cn() helper
    ├── components/
    │   ├── layout/               # SiteHeader, SiteFooter, LandingLayout, DashboardShell,
    │   │                         # Sidebar, DashboardHeader, ThemeToggle, StatusBadge, Logo
    │   ├── landing/              # Hero, FeatureGrid, HowItWorks, ClassGrid, ModelSnapshot,
    │   │                         # Limitations, Faq, CtaBand
    │   └── classify/             # Dropzone, ImagePreview, ResultPanel, ConfidenceMeter,
    │                             # ProbabilityBars, UncertainAlert, ErrorAlert
    ├── pages/
    │   ├── Landing.tsx
    │   ├── Classify.tsx
    │   ├── History.tsx
    │   ├── Model.tsx             # lazy-loaded
    │   ├── ApiDocs.tsx           # lazy-loaded
    │   └── NotFound.tsx
    └── test/
        ├── setup.ts              # RTL + MSW bootstrap
        ├── handlers.ts           # MSW handlers + mock fixtures
        ├── env.test.ts
        ├── validateFile.test.ts
        ├── useTheme.test.ts
        ├── useHistory.test.ts
        └── classify.test.tsx
```

## Setup

### Prerequisites

- Node.js 20+
- The backend server running (see `../server/`)

### Install and run

```bash
# 1. Install dependencies
npm install

# 2. Copy the example env file
cp .env.example .env.local

# 3. Edit .env.local — set VITE_API_BASE_URL to your backend origin
#    The backend must be running before you start the frontend.

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment Variables

All env variables must start with `VITE_` (Vite only exposes these to the browser).  
They are validated at startup by `src/config/env.ts` using Zod. The app **will not start** if any required variable is missing or malformed — you will see a clear error in the console.

| Variable | Required | Example | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | `http://localhost:8000` | Backend origin — no trailing slash |
| `VITE_API_PREFIX` | **Yes** | `/api/v1` | API path prefix — must start with `/` |
| `VITE_REQUEST_TIMEOUT_MS` | **Yes** | `30000` | Milliseconds before fetch times out |
| `VITE_MAX_UPLOAD_MB` | **Yes** | `10` | Max upload size — must match `MAX_UPLOAD_MB` in the backend |
| `VITE_ALLOWED_MIME` | **Yes** | `image/jpeg,image/png,image/webp` | Comma-separated list of allowed MIME types |
| `VITE_APP_NAME` | **Yes** | `SceneSense` | Displayed in header, footer, and `<title>` |
| `VITE_GITHUB_URL` | No | `https://github.com/you/repo` | GitHub link shown in header and footer. Leave empty to hide. |
| `VITE_HEALTH_POLL_MS` | **Yes** | `30000` | How often the health check is polled (ms) |

### `.env.local` vs `.env.development`

- `.env.development` — committed, localhost defaults, used by `npm run dev` automatically.  
- `.env.local` — git-ignored, overrides `.env.development`. Use this for personal or staging values.  
- `.env.production.local` — git-ignored, for production secrets baked at build time.

## Pointing at a Deployed Backend

1. Set `VITE_API_BASE_URL` to the deployed backend URL, e.g. `https://api.scenesense.example.com`.
2. Build the frontend: `npm run build`.
3. Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, etc.).
4. **CORS**: env variables are baked in at build time, so the deployed origin of your frontend must be allowed by the backend.

## CORS Setup

The backend must allow the **exact origin** (scheme + host + port) where the frontend is served.

**Symptom:** Browser console shows:  
> `Access to fetch at 'https://api.example.com/api/v1/predict' from origin 'https://app.example.com' has been blocked by CORS policy`

**Fix:**

1. In the backend `.env`, add the frontend origin to `CORS_ORIGINS`:
   ```
   # Development
   CORS_ORIGINS=["http://localhost:5173"]
   
   # Production — use the exact deployed URL, no trailing slash
   CORS_ORIGINS=["https://app.example.com"]
   ```
2. Restart the backend server.
3. The origin must match exactly — `http://localhost:5173` and `http://localhost:5174` are different origins.

**Checklist:**
- [ ] Scheme matches (`http` vs `https`)
- [ ] Host matches (no `www` vs `www` mismatch)
- [ ] Port matches (`:5173` vs `:5174`)
- [ ] Backend was restarted after the change
- [ ] No trailing slash in the origin

## Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Start Vite dev server on port 5173 |
| Build | `npm run build` | Type-check + Vite production build → `dist/` |
| Preview | `npm run preview` | Serve the `dist/` folder locally |
| Lint | `npm run lint` | Run oxlint |
| Test | `npm run test` | Run Vitest in watch mode |
| Test (CI) | `npx vitest run` | Single-run test pass |

> **Note:** `npm run build` bakes all `VITE_*` variables into the bundle at build time. To point at a different backend in production, set the variables in your hosting environment's build settings and rebuild.

## Design Notes

- **Zero hardcoded URLs**: All origins and paths come from env. Running `grep -rn "http://\|https://\|localhost" src` should find nothing except test files.
- **No credentials**: The API has no authentication. `credentials: "include"` is never sent.
- **Theme**: Light / Dark / System (default). Persisted in `localStorage`. A tiny inline script in `index.html` sets the `dark` class before first paint to prevent flash.
- **Accessibility**: WCAG 2.2 AA — semantic landmarks, skip-to-content link, visible focus rings, ARIA live region for classification results, text contrast ≥ 4.5:1, colour is never the only signal.

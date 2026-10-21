# BuildCalc

BuildCalc is a production-style Angular website with free calculators for common US home improvement, renovation, landscaping, and construction estimates.

Tagline: **Plan smarter. Build with confidence.**

## What BuildCalc includes

- Responsive landing page and calculator search.
- Calculator directory with category filtering.
- Six working calculators:
  - Gravel
  - Paint
  - Tile
  - Concrete
  - Square footage
  - Mulch
- Unit selectors for imperial and metric measurements where practical (feet, inches, meters, centimeters, and millimeters for small measurements).
- A site-wide US customary / Metric selector in the header. Changing it converts current calculator measurements and updates compatible result units.
- Material guides and supporting pages (about, contact, privacy, terms, disclaimer).
- SSR-ready Angular app (standalone components + lazy routes).
- Route-specific title + meta description handling via a centralized SEO service.
- `robots.txt` and a maintainable `sitemap.xml`.
- Unit tests for core calculation logic.

## Prerequisites

- Node.js 20+ (Node 26 was used during development)
- npm 10+

## Install dependencies

```bash
npm install
```

## Run locally

```bash
npm start
```

Default local URL: `http://localhost:4200`

## Run tests

```bash
npm test
```

## Build for production

```bash
npm run build
```

Build output:
- Browser + server bundles in [dist/buildcalc/](/Users/zlatko/WORK/calculators/dist/buildcalc)

## Project structure

- [src/app/core/](/Users/zlatko/WORK/calculators/src/app/core) — SEO utilities and global app logic
- [src/app/data/](/Users/zlatko/WORK/calculators/src/app/data) — calculator metadata and categories
- [src/app/pages/](/Users/zlatko/WORK/calculators/src/app/pages) — page-level components (home, directory, calculator, content pages)
- [src/app/utils/](/Users/zlatko/WORK/calculators/src/app/utils) — deterministic calculation utilities + tests
- [src/styles.scss](/Users/zlatko/WORK/calculators/src/styles.scss) — design tokens and shared styling
- [public/](/Users/zlatko/WORK/calculators/public) — static assets (`robots.txt`, `sitemap.xml`)

## Add another calculator

1. Add calculator metadata in [src/app/data/calculators.ts](/Users/zlatko/WORK/calculators/src/app/data/calculators.ts).
2. Add input defaults and field definitions in [src/app/pages/calculator.ts](/Users/zlatko/WORK/calculators/src/app/pages/calculator.ts).
3. Add a typed utility function in [src/app/utils/calculations.ts](/Users/zlatko/WORK/calculators/src/app/utils/calculations.ts).
4. Wire calculation handling in the `calculate()` switch in [src/app/pages/calculator.ts](/Users/zlatko/WORK/calculators/src/app/pages/calculator.ts).
5. Add tests in [src/app/utils/calculations.spec.ts](/Users/zlatko/WORK/calculators/src/app/utils/calculations.spec.ts).
6. Ensure route title/description behavior in [src/app/app.routes.ts](/Users/zlatko/WORK/calculators/src/app/app.routes.ts).

## SEO configuration

Route SEO metadata is set in [src/app/app.routes.ts](/Users/zlatko/WORK/calculators/src/app/app.routes.ts), and applied by [SeoService](/Users/zlatko/WORK/calculators/src/app/core/seo.service.ts).

To enable canonical URLs, set `SITE_BASE_URL` in [src/app/core/seo.service.ts](/Users/zlatko/WORK/calculators/src/app/core/seo.service.ts), for example:

```ts
export const SITE_BASE_URL = 'https://www.your-domain.com';
```

`public/sitemap.xml` uses route paths and should be updated alongside route changes.

## SSR / prerendering notes

- SSR is enabled via Angular SSR setup in this project.
- Server render mode is configured in [src/app/app.routes.server.ts](/Users/zlatko/WORK/calculators/src/app/app.routes.server.ts).
- Dynamic calculator and guide slug routes are configured for server rendering mode instead of static prerender parameter expansion.

## AdSense integration (after approval)

BuildCalc intentionally does **not** load ad scripts by default.

Current readiness:
- Dedicated ad container in UI (reserved slot) so layout can absorb ads without breaking calculator controls.
- No deceptive placement around core inputs/results.

After AdSense approval:
1. Add your official AdSense script to [src/index.html](/Users/zlatko/WORK/calculators/src/index.html).
2. Add your publisher ID and ad unit config.
3. Keep ad placements separate from form controls and result actions.
4. Re-review [privacy page copy in content pages](/Users/zlatko/WORK/calculators/src/app/pages/content.ts) to accurately reflect real cookie/advertising behavior.

## Calculation assumptions and limitations

- All calculators provide planning estimates, not engineering or contractual guarantees.
- Unit selectors convert entered measurements into consistent internal US customary units before calculating; square-footage results also show square meters.
- The header unit preference applies across calculator pages for the current browser session. US customary is the starting default.
- Density, coverage, product packaging, compaction, and site conditions vary.
- Waste allowance should be validated per project.
- Concrete volume outputs are not structural design guidance.

## Formula validation guidance

Recommended validation workflow:
- Verify the formula implementation in [src/app/utils/calculations.ts](/Users/zlatko/WORK/calculators/src/app/utils/calculations.ts).
- Run [src/app/utils/calculations.spec.ts](/Users/zlatko/WORK/calculators/src/app/utils/calculations.spec.ts) with `npm test`.
- Compare sample results against independent hand calculations.
- Confirm supplier-specific inputs (coverage, density, package size) before final purchase planning.

## Theming

Colors and fonts follow the project-hub palette (green ink, soft paper, coral accent; DM Sans). Light and dark themes are CSS-variable tokens in `src/styles.scss` (`:root` and `:root[data-theme='dark']`). `ThemeService` picks the saved choice or the system preference, persists it in `localStorage`, and an inline script in `index.html` prevents a flash on load. Use the header toggle to switch.

## Shared design system

Tokens, base frame and theme logic live in `design-system/` (see its README) so other projects can reuse the same style. `tokens.css` is loaded from `angular.json`.

## Deployment

The site is published at `https://zyankov.eu/calculators`. Build with `npm run build:prod`, which sets `--base-href /calculators/`. Canonical URLs, Open Graph, JSON-LD and the sitemap use `SITE_BASE_URL` in `src/app/core/seo.service.ts`. Image paths are relative so they work under the sub-path.

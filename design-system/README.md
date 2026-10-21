# Shared design system (project-hub palette)

Use this when starting any new project so all projects look and behave the same.

## Files

| File | Purpose |
| --- | --- |
| `tokens.css` | Colors (light + dark), radii, spacing, shadows. **Source of truth. Copy unchanged.** |
| `base.css` | Optional frame: container, sticky header, footer, card, button, inputs, focus ring. |
| `theme.js` | Theme resolve/apply/toggle with localStorage and system preference. |

## Setup in a new project

1. Copy `design-system/` into the project (or a shared package/submodule).
2. Load order: `tokens.css` → `base.css` → project styles.
3. Add `<meta name="theme-color" content="#f1f5ef">` and an inline head script that sets `document.documentElement.dataset.theme` from `resolveTheme()` before first paint.
4. Add a header button calling `toggleTheme()` (`aria-label` "Switch to dark/light theme").
5. Change only `THEME_KEY` in `theme.js` per project.
   - Angular: add `design-system/tokens.css` to `styles` in `angular.json` (see this repo's `ThemeService`).
   - Vite/React: `import './design-system/tokens.css'` in the entry file.

## Rules

- Never hardcode colors (`#fff`, hex, rgb) in components. Use `var(--token)`. If a color is missing, add the token to **both** themes in `tokens.css`, then copy the file to all projects.
- Themes are `:root` (light) and `:root[data-theme='dark']`. Do not use other attribute names or classes.
- Use `--on-accent` for text on `--accent`; never assume white.
- Keep text contrast at WCAG AA (4.5:1) in both themes.
- Typography: DM Sans for body. Display headings may use Fraunces (project-hub); fall back to Georgia.

## Tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--bg` | `#f1f5ef` | `#17271e` | Page background |
| `--surface` | `#fbfcf8` | `#24372d` | Cards, inputs, header |
| `--surface-soft` | `#e9f0e9` | `#2a4033` | Subtle panels |
| `--text` | `#20352d` | `#eef2e8` | Primary text |
| `--text-muted` | `#566a5d` | `#b0bdb0` | Secondary text |
| `--accent` | `#3f6b54` | `#8fc2a3` | Primary buttons, links |
| `--accent-dark` | `#2f5440` | `#a9d3b9` | Hover/active |
| `--accent-soft` | `#dce8de` | `#34503f` | Highlights, hover fills |
| `--on-accent` | `#ffffff` | `#12211a` | Text on accent |
| `--coral` | `#e76d53` | `#ef896e` | Secondary accent |
| `--border` | `#dce5dc` | `#405548` | Borders, dividers |
| `--line-strong` | `#2a4937` | `#8fa896` | Illustration strokes |
| `--grid` | `#d3ddd3` | `#3a5042` | Grid/background patterns |
| `--danger`, `--danger-bg`, `--danger-line` | red set | dark red set | Errors |
| `--focus` | `rgba(63,107,84,.4)` | `rgba(143,194,163,.5)` | Focus ring |
| `--footer-bg` | `#20352d` | `#0f1c15` | Footer |

Shape and spacing (same in both themes): `--radius-xs/sm/md/lg` = 0.5/0.8/1/1.5rem, `--space-1…6` = 0.4/0.75/1/1.5/2/3rem, `--shadow`, `--shadow-soft`.

## Frame (layout conventions)

- Sticky header (brand left, nav, controls right) → `main` → dark footer with link columns and a bottom bar.
- Content width: `.container` (max 72rem). Sections spaced with `.section`.
- Cards: `--surface`, 1px `--border`, `--radius-md`, soft shadow.
- Buttons: pill shape (999px), solid accent primary, `.button-quiet` secondary.
- Include a "Skip to content" link and visible focus rings.

## Keeping projects in sync

`tokens.css` is the only thing that must stay identical. When changed, update the copy in every project in the same commit/PR cycle and note it in the commit message ("design-system: …"). `project-hub` currently defines its own variable names (`--ink`, `--paper`, `--card`, `--line`); when touched, migrate it to these token names.

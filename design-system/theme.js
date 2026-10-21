/*
 * Framework-agnostic theme logic. Storage key is per project; everything else stays identical.
 * 1) Inline the `applyEarly` body in a <script> in <head> (before CSS paints) to avoid a flash.
 * 2) Call toggleTheme() from a header button.
 */
const THEME_KEY = 'buildcalc-theme'; // change per project, e.g. 'projecthub-theme'

export function resolveTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#17271e' : '#f1f5ef');
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

export function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

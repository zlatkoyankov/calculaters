import { DOCUMENT } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'buildcalc-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly theme = signal<Theme>(this.initialTheme());

  constructor() {
    effect(() => {
      const theme = this.theme();
      this.document.documentElement.setAttribute('data-theme', theme);
      this.document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', theme === 'dark' ? '#17271e' : '#f1f5ef');
      if (this.browser) {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
          // Storage can be unavailable (private mode); the theme still applies.
        }
      }
    });
  }

  toggle(): void {
    this.theme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }

  private initialTheme(): Theme {
    if (!this.browser) return 'light';
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      // Fall through to the system preference.
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}

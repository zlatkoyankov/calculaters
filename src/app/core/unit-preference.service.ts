import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type UnitSystem = 'us' | 'metric';

const STORAGE_KEY = 'buildcalc-units';

@Injectable({ providedIn: 'root' })
export class UnitPreferenceService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly system = signal<UnitSystem>(this.stored());

  setSystem(system: UnitSystem): void {
    this.system.set(system);
    if (!this.browser) return;
    try {
      localStorage.setItem(STORAGE_KEY, system);
    } catch {
      // Storage can be unavailable in private mode; the preference then lasts for the session only.
    }
  }

  private stored(): UnitSystem {
    if (!this.browser) return 'us';
    try {
      return localStorage.getItem(STORAGE_KEY) === 'metric' ? 'metric' : 'us';
    } catch {
      return 'us';
    }
  }
}

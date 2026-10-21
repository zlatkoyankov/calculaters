import { Injectable, signal } from '@angular/core';

export type UnitSystem = 'us' | 'metric';

@Injectable({ providedIn: 'root' })
export class UnitPreferenceService {
  readonly system = signal<UnitSystem>('us');

  setSystem(system: UnitSystem): void {
    this.system.set(system);
  }
}

import { describe, expect, it } from 'vitest';
import { CALCULATORS } from './calculators';
import { GUIDES } from './guides';

describe('GUIDES', () => {
  it('has unique slugs and links to existing calculators', () => {
    expect(new Set(GUIDES.map((g) => g.slug)).size).toBe(GUIDES.length);
    for (const guide of GUIDES) {
      expect(CALCULATORS.some((c) => c.slug === guide.calculatorSlug)).toBe(true);
      expect(guide.sections.length).toBeGreaterThan(0);
    }
  });
});

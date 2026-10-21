import { CALCULATORS } from './data/calculators';
import { GUIDES } from './data/guides';
import { routes } from './app.routes';
import { Route, UrlSegment } from '@angular/router';
import { readFileSync } from 'node:fs';

const matcher = (path: string) => routes.find((route) => route.path === path)!.canMatch![0] as
  (route: Route, segments: UrlSegment[]) => boolean;
const segs = (...parts: string[]) => parts.map((part) => new UrlSegment(part, {}));

describe('routes', () => {
  it('matches only known calculator and guide slugs so unknown URLs reach the 404 page', () => {
    expect(matcher('calculators/:slug')({}, segs('calculators', CALCULATORS[0].slug))).toBe(true);
    expect(matcher('calculators/:slug')({}, segs('calculators', 'unknown'))).toBe(false);
    expect(matcher('guides/:slug')({}, segs('guides', GUIDES[0].slug))).toBe(true);
    expect(matcher('guides/:slug')({}, segs('guides', 'unknown'))).toBe(false);
  });

  it('lists every calculator, guide and static page in the sitemap exactly once', () => {
    const sitemap = readFileSync('public/sitemap.xml', 'utf8');
    const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    expect(new Set(locs).size).toBe(locs.length);
    for (const calculator of CALCULATORS) expect(locs).toContain(`https://zyankov.eu/calculators/calculators/${calculator.slug}`);
    for (const guide of GUIDES) expect(locs).toContain(`https://zyankov.eu/calculators/guides/${guide.slug}`);
  });

  it('keeps meta descriptions within a snippet-friendly length', () => {
    for (const calculator of CALCULATORS) expect(calculator.description.length).toBeLessThanOrEqual(160);
    for (const guide of GUIDES) expect(guide.description.length).toBeLessThanOrEqual(160);
  });
});

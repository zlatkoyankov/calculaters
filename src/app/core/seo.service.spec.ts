import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SeoService, SITE_BASE_URL } from './seo.service';

function snapshot(segments: string[], data: Record<string, unknown>, title: string): ActivatedRouteSnapshot {
  const route = {
    title,
    data,
    firstChild: null,
    url: segments.map((path) => ({ path })),
  } as unknown as ActivatedRouteSnapshot;
  (route as { pathFromRoot: ActivatedRouteSnapshot[] }).pathFromRoot = [route];
  return route;
}

describe('SeoService', () => {
  const document = () => TestBed.inject(DOCUMENT);

  it('emits canonical, social tags and linked structured data for a calculator', () => {
    TestBed.inject(SeoService).updateFromRoute(
      snapshot(['calculators', 'gravel-calculator'], { description: 'Gravel estimates.' }, 'Gravel Calculator | BuildCalc'),
    );
    const doc = document();
    expect(doc.title).toBe('Gravel Calculator | BuildCalc');
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_BASE_URL}/calculators/gravel-calculator`);
    expect(doc.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(`${SITE_BASE_URL}/images/gravel.webp`);
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow');
    const json = JSON.parse(doc.getElementById('buildcalc-json-ld')!.textContent!) as { '@type': string; name?: string }[];
    expect(json.map((item) => item['@type'])).toEqual(['FAQPage', 'BreadcrumbList']);
  });

  it('names section breadcrumbs and drops canonical for noindex pages', () => {
    const seo = TestBed.inject(SeoService);
    seo.updateFromRoute(snapshot(['guides', 'tile-calculator-guide'], { description: 'Tile.' }, 'Tile estimating guide | BuildCalc'));
    const crumbs = JSON.parse(document().getElementById('buildcalc-json-ld')!.textContent!) as { itemListElement?: { name: string }[] }[];
    const breadcrumb = crumbs.find((item) => item.itemListElement)!;
    expect(breadcrumb.itemListElement!.map((item) => item.name)).toEqual(['Home', 'Material guides', 'Tile estimating guide']);

    seo.updateFromRoute(snapshot(['missing'], { noindex: true, description: 'x' }, 'Page not found | BuildCalc'));
    expect(document().querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(document().querySelector('link[rel="canonical"]')).toBeNull();
    expect(document().getElementById('buildcalc-json-ld')).toBeNull();
  });
});

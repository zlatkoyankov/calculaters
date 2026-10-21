import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { CALCULATORS } from '../data/calculators';
import { GUIDES } from '../data/guides';

// Public origin plus the sub-path the app is deployed under.
export const SITE_BASE_URL: string = 'https://zyankov.eu/calculators';
const SITE_NAME = 'BuildCalc';
const JSON_LD_ID = 'buildcalc-json-ld';
const SECTION_NAMES: Record<string, string> = { calculators: 'Calculators', guides: 'Material guides' };

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);

  updateFromRoute(root: ActivatedRouteSnapshot): void {
    let route = root;
    while (route.firstChild) route = route.firstChild;
    const title = route.title ?? 'BuildCalc | Plan smarter. Build with confidence.';
    const description = route.data['description'] as string | undefined;
    const path = '/' + route.pathFromRoot.flatMap((r) => r.url.map((segment) => segment.path)).join('/');
    this.document.title = title;
    if (description) this.setMeta('description', description);
    this.setMeta('og:title', title, 'property');
    if (description) this.setMeta('og:description', description, 'property');
    this.setMeta('og:type', 'website', 'property');
    this.setMeta('og:site_name', SITE_NAME, 'property');
    this.setMeta('twitter:card', 'summary_large_image');
    this.setMeta('robots', route.data['noindex'] ? 'noindex, nofollow' : 'index, follow');

    const image = this.absolute(`/images/${this.imageFor(path)}.webp`);
    if (image) this.setMeta('og:image', image, 'property');

    const canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      ?? this.document.createElement('link');
    canonical.rel = 'canonical';
    const canonicalUrl = this.absolute(path);
    if (canonicalUrl && !route.data['noindex']) {
      canonical.href = canonicalUrl;
      if (!canonical.isConnected) this.document.head.appendChild(canonical);
    } else if (canonical.isConnected) {
      canonical.remove();
    }
    if (canonicalUrl) this.setMeta('og:url', canonicalUrl, 'property');

    this.setJsonLd(route.data['noindex'] ? [] : this.structuredData(path, title, description));
  }

  private absolute(path: string): string {
    return SITE_BASE_URL ? `${SITE_BASE_URL.replace(/\/$/, '')}${path}` : '';
  }

  private imageFor(path: string): string {
    const slug = path.split('/')[2];
    return CALCULATORS.find((item) => item.slug === slug)?.kind
      ?? GUIDES.find((item) => item.slug === slug)?.kind
      ?? 'hero';
  }

  private structuredData(path: string, title: string, description?: string): object[] {
    const data: object[] = [];
    const url = this.absolute(path);
    if (path === '/') {
      data.push({ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, ...(url && { url }) });
    }
    const slug = path.split('/')[2];
    const calculator = path.startsWith('/calculators/') ? CALCULATORS.find((item) => item.slug === slug) : undefined;
    if (calculator) {
      data.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: calculator.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      });
    }
    const guide = path.startsWith('/guides/') ? GUIDES.find((item) => item.slug === slug) : undefined;
    if (guide) {
      data.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: guide.title,
        description: description ?? guide.description,
        publisher: { '@type': 'Organization', name: SITE_NAME },
        ...(url && { mainEntityOfPage: url }),
      });
    }
    if (path !== '/' && url) {
      const crumbs = path.split('/').filter(Boolean);
      data.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: this.absolute('/') },
          ...crumbs.map((_, index) => ({
            '@type': 'ListItem',
            position: index + 2,
            name: index === crumbs.length - 1 ? title.replace(` | ${SITE_NAME}`, '') : SECTION_NAMES[crumbs[index]] ?? crumbs[index],
            item: this.absolute(`/${crumbs.slice(0, index + 1).join('/')}`),
          })),
        ],
      });
    }
    return data;
  }

  private setJsonLd(data: object[]): void {
    this.document.getElementById(JSON_LD_ID)?.remove();
    if (!data.length) return;
    const script = this.document.createElement('script');
    script.id = JSON_LD_ID;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data.length === 1 ? data[0] : data);
    this.document.head.appendChild(script);
  }

  private setMeta(name: string, content: string, attribute = 'name'): void {
    const selector = `meta[${attribute}="${name}"]`;
    const element = this.document.querySelector<HTMLMetaElement>(selector) ?? this.document.createElement('meta');
    element.setAttribute(attribute, name);
    element.content = content;
    if (!element.isConnected) this.document.head.appendChild(element);
  }
}

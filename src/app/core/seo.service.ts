import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

export const SITE_BASE_URL: string = '';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);

  updateFromRoute(root: ActivatedRouteSnapshot): void {
    let route = root;
    while (route.firstChild) route = route.firstChild;
    const title = route.title ?? 'BuildCalc | Plan smarter. Build with confidence.';
    const description = route.data['description'] as string | undefined;
    this.document.title = title;
    if (description) this.setMeta('description', description);
    this.setMeta('og:title', title, 'property');
    if (description) this.setMeta('og:description', description, 'property');
    this.setMeta('og:type', 'website', 'property');

    const canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      ?? this.document.createElement('link');
    canonical.rel = 'canonical';
    if (SITE_BASE_URL) {
      canonical.href = `${SITE_BASE_URL.replace(/\/$/, '')}${this.document.location?.pathname ?? '/'}`;
      if (!canonical.isConnected) this.document.head.appendChild(canonical);
    } else if (canonical.isConnected) {
      canonical.remove();
    }
  }

  private setMeta(name: string, content: string, attribute = 'name'): void {
    const selector = `meta[${attribute}="${name}"]`;
    const element = this.document.querySelector<HTMLMetaElement>(selector) ?? this.document.createElement('meta');
    element.setAttribute(attribute, name);
    element.content = content;
    if (!element.isConnected) this.document.head.appendChild(element);
  }
}

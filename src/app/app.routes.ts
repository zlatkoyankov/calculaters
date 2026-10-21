import { ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';
import { CALCULATORS } from './data/calculators';

const calculatorForRoute = (route: ActivatedRouteSnapshot) =>
  CALCULATORS.find((calculator) => calculator.slug === route.paramMap.get('slug'));

const calculatorDescriptionResolver: ResolveFn<string> = (route) =>
  calculatorForRoute(route)?.description ?? 'Practical construction and home improvement calculator.';

const guideDescriptionResolver: ResolveFn<string> = (route) =>
  route.paramMap.get('slug') === 'gravel-calculator-guide'
    ? 'Learn how to estimate gravel volume and weight, verify material density, and plan a supplier order.'
    : 'Learn how to estimate wall paint from dimensions, coats, product coverage, and surface conditions.';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home').then((module) => module.HomePage),
    title: 'Free Construction & Home Improvement Calculators | BuildCalc',
    data: { description: 'Estimate materials for home improvement, renovation, and landscaping projects with free, practical BuildCalc calculators.' },
  },
  {
    path: 'calculators',
    loadComponent: () => import('./pages/directory').then((module) => module.DirectoryPage),
    title: 'Construction Calculators | BuildCalc',
    data: { description: 'Browse free gravel, paint, tile, concrete, square footage, and mulch calculators for your next project.' },
  },
  {
    path: 'calculators/:slug',
    loadComponent: () => import('./pages/calculator').then((module) => module.CalculatorPage),
    title: (route) => `${calculatorForRoute(route)?.title ?? 'Calculator'} | BuildCalc`,
    resolve: { description: calculatorDescriptionResolver },
  },
  {
    path: 'guides',
    loadComponent: () => import('./pages/content').then((module) => module.ContentPage),
    title: 'Material Guides | BuildCalc',
    data: {
      contentKey: 'guides',
      description: 'Practical material guides for estimating gravel and paint quantities, understanding coverage, and planning your project.',
    },
  },
  {
    path: 'guides/:slug',
    loadComponent: () => import('./pages/content').then((module) => module.ContentPage),
    title: (route) => route.paramMap.get('slug') === 'gravel-calculator-guide' ? 'Gravel Estimating Guide | BuildCalc' : 'Paint Estimating Guide | BuildCalc',
    resolve: { description: guideDescriptionResolver },
  },
  ...[
    { path: 'about', key: 'about', title: 'About BuildCalc', description: 'Learn about BuildCalc’s browser-based planning tools and transparent material estimate assumptions.' },
    { path: 'contact', key: 'contact', title: 'Contact BuildCalc', description: 'Contact information and message-delivery status for BuildCalc.' },
    { path: 'privacy', key: 'privacy', title: 'Privacy Policy | BuildCalc', description: 'Read the BuildCalc privacy policy starter and information about browser-based calculator data.' },
    { path: 'terms', key: 'terms', title: 'Terms of Use | BuildCalc', description: 'Review the terms for using BuildCalc planning estimates and calculators.' },
    { path: 'disclaimer', key: 'disclaimer', title: 'Disclaimer | BuildCalc', description: 'Important limitations for BuildCalc planning estimates and material calculators.' },
  ].map((page) => ({
    path: page.path,
    loadComponent: () => import('./pages/content').then((module) => module.ContentPage),
    title: page.title,
    data: { contentKey: page.key, description: page.description },
  })),
  { path: '**', redirectTo: '' },
];

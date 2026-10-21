import { Component, inject } from '@angular/core';
import { RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section">
      <div class="container empty-state">
        <p class="eyebrow">ERROR 404</p>
        <h1>We couldn’t find that page</h1>
        <p>The link may be outdated or mistyped. Try one of our calculators instead.</p>
        <a class="button" routerLink="/calculators">Browse calculators <span aria-hidden="true">→</span></a>
      </div>
    </section>
  `,
})
export class NotFoundPage {
  constructor() {
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 404;
  }
}

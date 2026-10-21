import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-material-art',
  standalone: true,
  template: `<img [src]="src()" alt="" width="900" height="600" [attr.loading]="eager() ? 'eager' : 'lazy'" decoding="async" />`,
  styles: `
    :host {
      display: block;
      overflow: hidden;
      background: var(--surface-soft);
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    :host-context(.calculator-card:hover) img {
      transform: scale(1.06);
    }
  `,
})
export class MaterialArtComponent {
  readonly kind = input.required<string>();
  readonly eager = input(false);
  protected readonly src = computed(() => `images/${this.kind()}.webp`);
}

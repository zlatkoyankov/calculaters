import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ad-slot',
  standalone: true,
  template: `
    <aside class="ad-slot-wrap" aria-label="Advertisement">
      @if (contained()) {
        <div class="container"><div class="ad-slot">Advertisement</div></div>
      } @else {
        <div class="ad-slot">Advertisement</div>
      }
    </aside>
  `,
  styles: `:host { display: block; }`,
})
export class AdSlotComponent {
  readonly contained = input(true);
}

import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaterialArtComponent } from '../shared/material-art.component';
import { CALCULATORS, CATEGORIES, FEATURED_SLUGS } from '../data/calculators';

@Component({
  standalone: true,
  imports: [RouterLink, MaterialArtComponent],
  templateUrl: './home.html',
})
export class HomePage {
  protected readonly calculators = CALCULATORS;
  protected readonly categories = CATEGORIES;
  protected readonly search = signal('');
  protected readonly matches = computed(() => {
    const query = this.search().trim().toLowerCase();
    if (!query) return CALCULATORS.filter((item) => FEATURED_SLUGS.includes(item.slug));
    return CALCULATORS.filter((item) =>
      [item.title, item.category, item.description, ...item.keywords].join(' ').toLowerCase().includes(query),
    );
  });

  protected onSearchInput(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

}

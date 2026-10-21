import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MaterialArtComponent } from '../shared/material-art.component';
import { CALCULATORS, CATEGORIES } from '../data/calculators';

@Component({
  standalone: true,
  imports: [RouterLink, MaterialArtComponent],
  templateUrl: './directory.html',
})
export class DirectoryPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly calculators = CALCULATORS;
  protected readonly categories = CATEGORIES;
  protected readonly search = signal('');
  protected readonly category = signal('');
  protected readonly matches = computed(() => {
    const query = this.search().trim().toLowerCase();
    const category = this.category();
    return CALCULATORS.filter((item) =>
      (!category || item.category === category)
      && (!query || [item.title, item.category, item.description, ...item.keywords].join(' ').toLowerCase().includes(query)),
    );
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => this.category.set(params.get('category') ?? ''));
  }

  protected onSearchInput(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected onCategoryChange(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value);
  }

}

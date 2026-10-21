import { Component, input } from '@angular/core';

@Component({
  selector: 'app-material-art',
  standalone: true,
  template: `
    <svg class="material-art" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="160" height="100" fill="var(--k-bg)" />
      <circle cx="132" cy="22" r="26" fill="var(--k-a)" opacity="0.35" />
      <circle cx="18" cy="92" r="34" fill="var(--k-b)" opacity="0.18" />
      @switch (kind()) {
        @case ('gravel') {
          <path d="M20 88 Q80 18 140 88Z" fill="var(--k-b)" />
          <path d="M44 88 Q80 40 116 88Z" fill="var(--k-a)" />
          <g fill="var(--k-c)">
            <circle cx="62" cy="76" r="6" /><circle cx="84" cy="66" r="5" /><circle cx="98" cy="80" r="7" />
            <circle cx="74" cy="84" r="4" /><circle cx="110" cy="86" r="4" /><circle cx="48" cy="86" r="4" />
          </g>
          <rect x="10" y="88" width="140" height="6" rx="3" fill="var(--k-c)" opacity="0.5" />
        }
        @case ('paint') {
          <path d="M52 44h56l-5 46a4 4 0 0 1-4 3H61a4 4 0 0 1-4-3z" fill="var(--k-b)" />
          <ellipse cx="80" cy="44" rx="28" ry="7" fill="var(--k-a)" />
          <ellipse cx="80" cy="44" rx="22" ry="4.5" fill="var(--k-c)" />
          <rect x="96" y="12" width="44" height="16" rx="5" fill="var(--k-c)" />
          <path d="M140 20h8v18H100v10" stroke="var(--k-b)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        }
        @case ('tile') {
          <g transform="translate(26 18)">
            <rect x="0" y="0" width="34" height="34" rx="4" fill="var(--k-b)" />
            <rect x="38" y="0" width="34" height="34" rx="4" fill="var(--k-a)" />
            <rect x="76" y="0" width="34" height="34" rx="4" fill="var(--k-c)" />
            <rect x="0" y="38" width="34" height="34" rx="4" fill="var(--k-a)" />
            <rect x="38" y="38" width="34" height="34" rx="4" fill="var(--k-c)" />
            <rect x="76" y="38" width="34" height="34" rx="4" fill="var(--k-b)" />
            <path d="M6 28 28 6M44 28 66 6" stroke="#fff" stroke-opacity="0.4" stroke-width="3" stroke-linecap="round" />
          </g>
        }
        @case ('concrete') {
          <path d="M28 56 80 34l52 22-52 22z" fill="var(--k-a)" />
          <path d="M28 56v14l52 22V78z" fill="var(--k-b)" />
          <path d="M132 56v14L80 92V78z" fill="var(--k-c)" />
          <path d="M50 56 80 43l30 13" stroke="#fff" stroke-opacity="0.45" stroke-width="2" fill="none" stroke-linecap="round" />
          <path d="M36 28h30M96 20h28" stroke="var(--k-c)" stroke-width="3" stroke-linecap="round" opacity="0.5" />
        }
        @case ('area') {
          <rect x="34" y="24" width="92" height="56" rx="4" fill="var(--k-a)" stroke="var(--k-c)" stroke-width="3" />
          <path d="M34 52h40v28M74 52V24" stroke="var(--k-c)" stroke-width="3" fill="none" />
          <path d="M34 14h92M34 10v8M126 10v8" stroke="var(--k-b)" stroke-width="3" stroke-linecap="round" />
          <path d="M138 24v56M134 24h8M134 80h8" stroke="var(--k-b)" stroke-width="3" stroke-linecap="round" />
        }
        @case ('mulch') {
          <path d="M14 88Q50 58 80 74T146 70V94H14z" fill="var(--k-c)" />
          <path d="M14 94Q60 76 100 84T146 80V96H14z" fill="var(--k-b)" />
          <path d="M80 74V42" stroke="var(--k-a)" stroke-width="4" stroke-linecap="round" />
          <path d="M80 56C64 56 56 46 56 34c14 0 24 8 24 22Z" fill="var(--k-a)" />
          <path d="M80 48c0-14 10-22 26-22 0 12-10 22-26 22Z" fill="var(--k-a)" opacity="0.8" />
        }
        @default {
          <rect x="40" y="26" width="80" height="48" rx="8" fill="var(--k-a)" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: block;
      overflow: hidden;
    }
    .material-art {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class MaterialArtComponent {
  readonly kind = input.required<string>();
}

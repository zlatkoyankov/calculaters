import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CalculatorInfo, CALCULATORS, CalculatorKind } from '../data/calculators';
import {
  calculateArea, calculateConcrete, calculateGravel, calculateMulch, calculatePaint, calculateTile, ConcreteInput, Estimate, EstimateRow, GravelInput, MulchInput, PaintInput, TileInput, Values,
} from '../utils/calculations';

interface Field {
  key: string;
  label: string;
  unit: string;
  min: number;
  step: number;
  hint?: string;
  optional?: boolean;
  unitKey?: string;
  unitOptions?: { value: number; label: string }[];
}

interface AreaEntry {
  length: number;
  width: number;
  unit: 'ft' | 'in' | 'm' | 'cm';
}

const DISTANCE_UNITS = [
  { value: 0, label: 'ft' },
  { value: 1, label: 'in' },
  { value: 2, label: 'm' },
  { value: 3, label: 'cm' },
];
const INCH_UNITS = [
  { value: 1, label: 'in' },
  { value: 3, label: 'cm' },
  { value: 4, label: 'mm' },
];
const AREA_UNITS = [
  { value: 0, label: 'sq ft' },
  { value: 1, label: 'sq in' },
  { value: 2, label: 'sq m' },
  { value: 3, label: 'sq cm' },
];

const FORM_FIELDS: Record<Exclude<CalculatorKind, 'area'>, Field[]> = {
  gravel: [
    { key: 'length', label: 'Area length', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'width', label: 'Area width', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'depth', label: 'Gravel depth', unit: 'in', unitKey: 'depthUnit', unitOptions: INCH_UNITS, min: 0.01, step: 0.1 },
    { key: 'density', label: 'Material density', unit: 'lb / cu yd', min: 0, step: 1, hint: 'Example only—confirm the density with your supplier.' },
    { key: 'waste', label: 'Waste allowance', unit: '%', min: 0, step: 1 },
    { key: 'price', label: 'Price per unit (optional)', unit: '$', min: 0, step: 0.01, optional: true },
  ],
  paint: [
    { key: 'width', label: 'Wall width', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'height', label: 'Wall height', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'openings', label: 'Doors and windows to subtract', unit: 'sq ft', unitKey: 'openingsUnit', unitOptions: AREA_UNITS, min: 0, step: 0.5 },
    { key: 'coats', label: 'Number of coats', unit: 'coats', min: 1, step: 1 },
    { key: 'coverage', label: 'Paint coverage', unit: 'sq ft / gallon', min: 0.01, step: 1, hint: 'Check the label for your paint’s stated coverage.' },
    { key: 'waste', label: 'Extra allowance', unit: '%', min: 0, step: 1 },
    { key: 'price', label: 'Price per gallon (optional)', unit: '$', min: 0, step: 0.01, optional: true },
  ],
  tile: [
    { key: 'length', label: 'Room length', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'width', label: 'Room width', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'tileLength', label: 'Tile length', unit: 'in', unitKey: 'tileUnit', unitOptions: INCH_UNITS, min: 0.01, step: 0.1 },
    { key: 'tileWidth', label: 'Tile width', unit: 'in', unitKey: 'tileUnit', unitOptions: INCH_UNITS, min: 0.01, step: 0.1 },
    { key: 'grout', label: 'Grout spacing', unit: 'in', unitKey: 'groutUnit', unitOptions: INCH_UNITS, min: 0, step: 0.01 },
    { key: 'waste', label: 'Waste allowance', unit: '%', min: 0, step: 1 },
    { key: 'boxSize', label: 'Tiles per box (optional)', unit: 'tiles', min: 0, step: 1, optional: true },
    { key: 'price', label: 'Price per tile or box (optional)', unit: '$', min: 0, step: 0.01, optional: true },
  ],
  concrete: [
    { key: 'length', label: 'Slab length', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'width', label: 'Slab width', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'depth', label: 'Slab thickness', unit: 'in', unitKey: 'depthUnit', unitOptions: INCH_UNITS, min: 0.01, step: 0.1 },
    { key: 'waste', label: 'Waste allowance', unit: '%', min: 0, step: 1 },
    { key: 'price', label: 'Price per cubic yard (optional)', unit: '$', min: 0, step: 0.01, optional: true },
  ],
  mulch: [
    { key: 'length', label: 'Bed length', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'width', label: 'Bed width', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'depth', label: 'Mulch depth', unit: 'in', unitKey: 'depthUnit', unitOptions: INCH_UNITS, min: 0.01, step: 0.1 },
    { key: 'waste', label: 'Waste allowance', unit: '%', min: 0, step: 1 },
    { key: 'price', label: 'Price per cubic yard (optional)', unit: '$', min: 0, step: 0.01, optional: true },
  ],
};

const DEFAULTS: Record<CalculatorKind, Values> = {
  gravel: { length: 20, width: 10, depth: 3, density: 2700, waste: 10, price: 0, priceUnit: 0, dimensionUnit: 0, depthUnit: 1 },
  paint: { width: 12, height: 8, openings: 20, coats: 2, coverage: 350, waste: 0, price: 0, dimensionUnit: 0, openingsUnit: 0 },
  tile: { length: 10, width: 12, tileLength: 12, tileWidth: 12, grout: 0.125, waste: 10, boxSize: 10, price: 0, priceUnit: 0, dimensionUnit: 0, tileUnit: 1, groutUnit: 1 },
  concrete: { length: 10, width: 10, depth: 4, waste: 10, price: 0, dimensionUnit: 0, depthUnit: 1 },
  area: {},
  mulch: { length: 10, width: 10, depth: 3, waste: 10, price: 0, dimensionUnit: 0, depthUnit: 1 },
};

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './calculator.html',
})
export class CalculatorPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly calculator = signal<CalculatorInfo | null>(null);
  protected readonly values = signal<Values>({});
  protected readonly result = signal<Estimate | null>(null);
  protected readonly error = signal('');
  protected readonly copied = signal(false);
  protected readonly areas = signal<AreaEntry[]>([{ length: 12, width: 10, unit: 'ft' }, { length: 14, width: 11, unit: 'ft' }]);
  protected readonly fields = computed(() => {
    const kind = this.calculator()?.kind;
    return kind && kind !== 'area' ? FORM_FIELDS[kind] : [];
  });
  protected readonly formattedRows = computed(() => (this.result()?.rows ?? []).map((row) => ({
    ...row,
    displayValue: this.formatRow(row),
  })));

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const calculator = CALCULATORS.find((item) => item.slug === params.get('slug')) ?? null;
      this.calculator.set(calculator);
      if (calculator) this.reset();
    });
  }

  protected setValue(key: string, value: number): void {
    this.values.update((current) => ({ ...current, [key]: Number(value) }));
  }

  protected calculate(): void {
    const calculator = this.calculator();
    if (!calculator) return;
    this.error.set('');
    try {
      let estimate: Estimate;
      switch (calculator.kind) {
        case 'gravel': estimate = calculateGravel(this.toGravelInput(this.values())); break;
        case 'paint': estimate = calculatePaint(this.toPaintInput(this.values())); break;
        case 'tile': estimate = calculateTile(this.toTileInput(this.values())); break;
        case 'concrete': estimate = calculateConcrete(this.toConcreteInput(this.values())); break;
        case 'mulch': estimate = calculateMulch(this.toMulchInput(this.values())); break;
        case 'area': estimate = calculateArea(this.areas()); break;
      }
      this.result.set(estimate);
    } catch (error: unknown) {
      this.result.set(null);
      this.error.set(error instanceof Error ? error.message : 'Please check your measurements and try again.');
    }
  }

  protected reset(): void {
    const kind = this.calculator()?.kind;
    if (!kind) return;
    this.values.set({ ...DEFAULTS[kind] });
    if (kind === 'area') this.areas.set([{ length: 12, width: 10, unit: 'ft' }, { length: 14, width: 11, unit: 'ft' }]);
    this.result.set(null);
    this.error.set('');
    this.copied.set(false);
  }

  protected addArea(): void {
    this.areas.update((areas) => [...areas, { length: 0, width: 0, unit: 'ft' }]);
  }

  protected removeArea(index: number): void {
    this.areas.update((areas) => areas.filter((_, itemIndex) => itemIndex !== index));
    this.result.set(null);
  }

  protected setAreaValue(index: number, key: 'length' | 'width', value: number): void {
    this.areas.update((areas) => areas.map((area, itemIndex) => itemIndex === index ? { ...area, [key]: Number(value) } : area));
  }

  protected setAreaUnit(index: number, event: Event): void {
    const selected = (event.target as HTMLSelectElement).value;
    const unit: AreaEntry['unit'] = selected === 'in' || selected === 'm' || selected === 'cm' ? selected : 'ft';
    this.areas.update((areas) => areas.map((area, itemIndex) => itemIndex === index ? { ...area, unit } : area));
  }

  protected relatedCalculators(slug: string): CalculatorInfo[] {
    return CALCULATORS.filter((item) => item.slug !== slug).slice(0, 3);
  }

  protected limitationFor(kind: CalculatorKind): string {
    const limitations: Record<CalculatorKind, string> = {
      gravel: 'Gravel density depends on material, moisture, and compaction. Confirm the density and order quantity with your supplier.',
      paint: 'Paint coverage varies by product and surface. This estimate covers one rectangular wall; check the label and account for other surfaces separately.',
      tile: 'Tile coverage is approximate for a basic rectangular layout and does not model complex cuts, patterns, diagonal layouts, or irregular rooms.',
      concrete: 'This estimates volume only. It does not replace structural engineering, local codes, reinforcement design, or placement requirements.',
      area: 'This totals rectangular measurements. Break irregular shapes into separate rectangles without overlap.',
      mulch: 'Depth needs vary with material and intended use. Follow local horticultural guidance and keep mulch clear of plant stems and trunks.',
    };
    return limitations[kind];
  }

  protected printResults(): void {
    if (typeof window !== 'undefined') window.print();
  }

  protected async copyResults(): Promise<void> {
    const calculator = this.calculator();
    const result = this.result();
    if (!calculator || !result) return;
    const summary = `${calculator.title}\n${result.summary}\n${result.rows.map((row) => `${row.label}: ${this.formatRow(row)}`).join('\n')}`;
    try {
      if (!navigator.clipboard) throw new Error('Clipboard access is unavailable.');
      await navigator.clipboard.writeText(summary);
      this.copied.set(true);
    } catch {
      this.error.set('Your browser could not copy the results. Select and copy them manually.');
    }
  }

  private formatRow(row: EstimateRow): string {
    const number = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: row.precision ?? 2,
      maximumFractionDigits: row.precision ?? 2,
    }).format(row.value);
    return row.unit === 'USD' ? `$${number}` : `${number} ${row.unit}`;
  }

  private number(values: Values, key: string): number {
    return Number(values[key] ?? 0);
  }

  private toGravelInput(values: Values): GravelInput {
    return {
      length: this.number(values, 'length'),
      width: this.number(values, 'width'),
      depth: this.number(values, 'depth'),
      density: this.number(values, 'density'),
      waste: this.number(values, 'waste'),
      price: this.number(values, 'price'),
      priceUnit: this.number(values, 'priceUnit'),
      dimensionUnit: this.number(values, 'dimensionUnit'),
      depthUnit: this.number(values, 'depthUnit'),
    };
  }

  private toPaintInput(values: Values): PaintInput {
    return {
      width: this.number(values, 'width'),
      height: this.number(values, 'height'),
      openings: this.number(values, 'openings'),
      coats: this.number(values, 'coats'),
      coverage: this.number(values, 'coverage'),
      waste: this.number(values, 'waste'),
      price: this.number(values, 'price'),
      dimensionUnit: this.number(values, 'dimensionUnit'),
      openingsUnit: this.number(values, 'openingsUnit'),
    };
  }

  private toTileInput(values: Values): TileInput {
    return {
      length: this.number(values, 'length'),
      width: this.number(values, 'width'),
      tileLength: this.number(values, 'tileLength'),
      tileWidth: this.number(values, 'tileWidth'),
      grout: this.number(values, 'grout'),
      waste: this.number(values, 'waste'),
      boxSize: this.number(values, 'boxSize'),
      price: this.number(values, 'price'),
      priceUnit: this.number(values, 'priceUnit'),
      dimensionUnit: this.number(values, 'dimensionUnit'),
      tileUnit: this.number(values, 'tileUnit'),
      groutUnit: this.number(values, 'groutUnit'),
    };
  }

  private toConcreteInput(values: Values): ConcreteInput {
    return {
      length: this.number(values, 'length'),
      width: this.number(values, 'width'),
      depth: this.number(values, 'depth'),
      waste: this.number(values, 'waste'),
      price: this.number(values, 'price'),
      dimensionUnit: this.number(values, 'dimensionUnit'),
      depthUnit: this.number(values, 'depthUnit'),
    };
  }

  private toMulchInput(values: Values): MulchInput {
    return {
      length: this.number(values, 'length'),
      width: this.number(values, 'width'),
      depth: this.number(values, 'depth'),
      waste: this.number(values, 'waste'),
      price: this.number(values, 'price'),
      dimensionUnit: this.number(values, 'dimensionUnit'),
      depthUnit: this.number(values, 'depthUnit'),
    };
  }
}

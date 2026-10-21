import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UnitPreferenceService, UnitSystem } from '../core/unit-preference.service';
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
const US_DISTANCE_UNITS = DISTANCE_UNITS.slice(0, 2);
const METRIC_DISTANCE_UNITS = DISTANCE_UNITS.slice(2);
const INCH_UNITS = [
  { value: 1, label: 'in' },
  { value: 3, label: 'cm' },
  { value: 4, label: 'mm' },
];
const US_SMALL_UNITS = INCH_UNITS.slice(0, 1);
const METRIC_SMALL_UNITS = INCH_UNITS.slice(1);
const AREA_UNITS = [
  { value: 0, label: 'sq ft' },
  { value: 1, label: 'sq in' },
  { value: 2, label: 'sq m' },
  { value: 3, label: 'sq cm' },
];
const US_AREA_UNITS = AREA_UNITS.slice(0, 2);
const METRIC_AREA_UNITS = AREA_UNITS.slice(2);
const DENSITY_UNITS = [{ value: 0, label: 'lb / cu yd' }, { value: 1, label: 'kg / cu m' }];
const COVERAGE_UNITS = [{ value: 0, label: 'sq ft / gal' }, { value: 1, label: 'sq m / L' }];

const FORM_FIELDS: Record<Exclude<CalculatorKind, 'area'>, Field[]> = {
  gravel: [
    { key: 'length', label: 'Area length', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'width', label: 'Area width', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'depth', label: 'Gravel depth', unit: 'in', unitKey: 'depthUnit', unitOptions: INCH_UNITS, min: 0.01, step: 0.1 },
    { key: 'density', label: 'Material density', unit: 'lb / cu yd', unitKey: 'densityUnit', unitOptions: DENSITY_UNITS, min: 0, step: 1, hint: 'Example only—confirm the density with your supplier.' },
    { key: 'waste', label: 'Waste allowance', unit: '%', min: 0, step: 1 },
    { key: 'price', label: 'Price per unit', unit: '$', min: 0, step: 0.01, optional: true },
  ],
  paint: [
    { key: 'width', label: 'Wall width', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'height', label: 'Wall height', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'openings', label: 'Doors and windows to subtract', unit: 'sq ft', unitKey: 'openingsUnit', unitOptions: AREA_UNITS, min: 0, step: 0.5 },
    { key: 'coats', label: 'Number of coats', unit: 'coats', min: 1, step: 1 },
    { key: 'coverage', label: 'Paint coverage', unit: 'sq ft / gallon', unitKey: 'coverageUnit', unitOptions: COVERAGE_UNITS, min: 0.01, step: 1, hint: 'Check the label for your paint’s stated coverage.' },
    { key: 'waste', label: 'Extra allowance', unit: '%', min: 0, step: 1 },
    { key: 'price', label: 'Price per gallon', unit: '$', min: 0, step: 0.01, optional: true },
  ],
  tile: [
    { key: 'length', label: 'Room length', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'width', label: 'Room width', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'tileLength', label: 'Tile length', unit: 'in', unitKey: 'tileUnit', unitOptions: INCH_UNITS, min: 0.01, step: 0.1 },
    { key: 'tileWidth', label: 'Tile width', unit: 'in', unitKey: 'tileUnit', unitOptions: INCH_UNITS, min: 0.01, step: 0.1 },
    { key: 'grout', label: 'Grout spacing', unit: 'in', unitKey: 'groutUnit', unitOptions: INCH_UNITS, min: 0, step: 0.01 },
    { key: 'waste', label: 'Waste allowance', unit: '%', min: 0, step: 1 },
    { key: 'boxSize', label: 'Tiles per box', unit: 'tiles', min: 0, step: 1, optional: true },
    { key: 'price', label: 'Price per tile or box', unit: '$', min: 0, step: 0.01, optional: true },
  ],
  concrete: [
    { key: 'length', label: 'Slab length', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'width', label: 'Slab width', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'depth', label: 'Slab thickness', unit: 'in', unitKey: 'depthUnit', unitOptions: INCH_UNITS, min: 0.01, step: 0.1 },
    { key: 'waste', label: 'Waste allowance', unit: '%', min: 0, step: 1 },
    { key: 'price', label: 'Price per cubic yard', unit: '$', min: 0, step: 0.01, optional: true },
  ],
  mulch: [
    { key: 'length', label: 'Bed length', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'width', label: 'Bed width', unit: 'ft', unitKey: 'dimensionUnit', unitOptions: DISTANCE_UNITS, min: 0.01, step: 0.1 },
    { key: 'depth', label: 'Mulch depth', unit: 'in', unitKey: 'depthUnit', unitOptions: INCH_UNITS, min: 0.01, step: 0.1 },
    { key: 'waste', label: 'Waste allowance', unit: '%', min: 0, step: 1 },
    { key: 'price', label: 'Price per cubic yard', unit: '$', min: 0, step: 0.01, optional: true },
  ],
};

const DEFAULTS: Record<CalculatorKind, Values> = {
  gravel: { length: 20, width: 10, depth: 3, density: 2700, waste: 10, price: 0, priceUnit: 0, dimensionUnit: 0, depthUnit: 1 },
  paint: { width: 12, height: 8, openings: 20, coats: 2, coverage: 350, waste: 0, price: 0, dimensionUnit: 0, openingsUnit: 0, coverageUnit: 0 },
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
  private readonly unitPreference = inject(UnitPreferenceService);
  protected readonly unitSystem = this.unitPreference.system;
  private previousUnitSystem: UnitSystem = this.unitPreference.system();
  protected readonly fields = computed(() => {
    const kind = this.calculator()?.kind;
    const system = this.unitPreference.system();
    return kind && kind !== 'area'
      ? FORM_FIELDS[kind].map((field) => ({
        ...field,
        label: this.localizedFieldLabel(field, system),
        unitOptions: field.unitOptions?.filter((unit) => {
          if (field.unitKey === 'dimensionUnit') return system === 'us' ? US_DISTANCE_UNITS.some((item) => item.value === unit.value) : METRIC_DISTANCE_UNITS.some((item) => item.value === unit.value);
          if (field.unitKey === 'depthUnit' || field.unitKey === 'tileUnit' || field.unitKey === 'groutUnit') return system === 'us' ? US_SMALL_UNITS.some((item) => item.value === unit.value) : METRIC_SMALL_UNITS.some((item) => item.value === unit.value);
          if (field.unitKey === 'openingsUnit') return system === 'us' ? US_AREA_UNITS.some((item) => item.value === unit.value) : METRIC_AREA_UNITS.some((item) => item.value === unit.value);
          if (field.unitKey === 'densityUnit' || field.unitKey === 'coverageUnit') return unit.value === (system === 'us' ? 0 : 1);
          return true;
        }),
      }))
      : [];
  });
  protected readonly formattedRows = computed(() => (this.result()?.rows ?? []).map((row) => {
    const converted = this.convertResultRow(row);
    return { ...converted, displayValue: this.formatRow(converted) };
  }));
  protected readonly resultSummary = computed(() => {
    const result = this.result();
    const calculator = this.calculator();
    if (!result || !calculator || this.unitPreference.system() === 'us') return result?.summary ?? '';
    const rows = this.formattedRows();
    const volume = rows.find((row) => row.label === 'Volume with waste');
    const weight = rows.find((row) => row.label === 'Estimated weight');
    const purchase = rows.find((row) => row.label === 'Whole-liter purchase');
    if (calculator.kind === 'paint' && purchase) return `Plan for ${purchase.displayValue}.`;
    if ((calculator.kind === 'concrete' || calculator.kind === 'mulch') && volume) return `${volume.displayValue} including waste.`;
    if (calculator.kind === 'gravel' && volume) return `${volume.displayValue}${weight ? ` (about ${weight.displayValue})` : ''} including waste.`;
    return result.summary;
  });

  constructor() {
    effect(() => {
      const system = this.unitPreference.system();
      if (system !== this.previousUnitSystem) {
        this.convertMeasurements(this.previousUnitSystem, system);
        this.previousUnitSystem = system;
      }
    });
    this.route.paramMap.subscribe((params) => {
      const calculator = CALCULATORS.find((item) => item.slug === params.get('slug')) ?? null;
      this.calculator.set(calculator);
      if (calculator) this.reset();
    });
  }

  protected setValue(key: string, value: number): void {
    this.values.update((current) => ({ ...current, [key]: Number(value) }));
  }

  protected setUnitValue(key: string, value: number): void {
    const nextUnit = Number(value);
    this.values.update((current) => {
      const updated = { ...current };
      const unitKey = key;
      const previousUnit = this.number(current, unitKey);
      const valueKeys = ({
        dimensionUnit: ['length', 'width'],
        depthUnit: ['depth'],
        tileUnit: ['tileLength', 'tileWidth'],
        groutUnit: ['grout'],
        openingsUnit: ['openings'],
        densityUnit: ['density'],
        coverageUnit: ['coverage'],
      }[unitKey] ?? []).filter((candidate) => current[candidate] !== undefined);
      for (const valueKey of valueKeys) {
        const currentValue = this.number(current, valueKey);
        if (unitKey === 'openingsUnit') updated[valueKey] = this.convertArea(currentValue, previousUnit, nextUnit);
        else if (unitKey === 'densityUnit') updated[valueKey] = previousUnit === 0 ? currentValue * 0.593276 : currentValue / 0.593276;
        else if (unitKey === 'coverageUnit') updated[valueKey] = previousUnit === 0 ? currentValue / 40.745 : currentValue * 40.745;
        else updated[valueKey] = this.convertLength(currentValue, previousUnit, nextUnit);
      }
      updated[unitKey] = nextUnit;
      return updated;
    });
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
    const metric = this.unitPreference.system() === 'metric';
    const defaults = { ...DEFAULTS[kind] };
    if (metric) {
      for (const key of ['length', 'width']) {
        if (defaults[key] !== undefined) defaults[key] = this.convertLength(defaults[key], 0, 2);
      }
      for (const key of ['depth', 'tileLength', 'tileWidth', 'grout']) {
        if (defaults[key] !== undefined) defaults[key] = this.convertLength(defaults[key], 1, 3);
      }
      if (defaults['openings'] !== undefined) defaults['openings'] = this.convertArea(defaults['openings'], 0, 2);
      defaults['dimensionUnit'] = 2;
      defaults['depthUnit'] = 3;
      defaults['tileUnit'] = 3;
      defaults['groutUnit'] = 3;
      defaults['openingsUnit'] = 2;
      defaults['densityUnit'] = 1;
      defaults['coverageUnit'] = 1;
      if (kind === 'gravel') defaults['density'] = 1600;
      if (kind === 'paint') {
        defaults['coverage'] = 9;
        defaults['openings'] = 1.86;
      }
    }
    this.values.set(defaults);
    if (kind === 'area') {
      const unit: AreaEntry['unit'] = metric ? 'm' : 'ft';
      this.areas.set([{ length: metric ? 3.66 : 12, width: metric ? 3.05 : 10, unit }, { length: metric ? 4.27 : 14, width: metric ? 3.35 : 11, unit }]);
    }
    this.result.set(null);
    this.error.set('');
    this.copied.set(false);
  }

  protected addArea(): void {
    const unit: AreaEntry['unit'] = this.unitPreference.system() === 'metric' ? 'm' : 'ft';
    this.areas.update((areas) => [...areas, { length: 0, width: 0, unit }]);
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
    this.areas.update((areas) => areas.map((area, itemIndex) => itemIndex === index ? {
      length: this.convertAreaLength(area.length, area.unit, unit),
      width: this.convertAreaLength(area.width, area.unit, unit),
      unit,
    } : area));
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
    const summary = `${calculator.title}\n${this.resultSummary()}\n${this.formattedRows().map((row) => `${row.label}: ${row.displayValue}`).join('\n')}`;
    try {
      if (!navigator.clipboard) throw new Error('Clipboard access is unavailable.');
      await navigator.clipboard.writeText(summary);
      this.copied.set(true);
    } catch {
      this.error.set('Your browser could not copy the results. Select and copy them manually.');
    }
  }

  private convertMeasurements(from: UnitSystem, to: UnitSystem): void {
    const values = { ...this.values() };
    const targetLength = to === 'us' ? 0 : 2;
    const sourceSmall = from === 'us' ? 1 : 3;
    const targetSmall = to === 'us' ? 1 : 3;
    const targetArea = to === 'us' ? 0 : 2;

    for (const key of ['length', 'width']) {
      if (values[key] !== undefined) {
        values[key] = this.convertLength(this.number(values, key), this.number(values, 'dimensionUnit'), targetLength);
      }
    }
    for (const key of ['depth', 'tileLength', 'tileWidth', 'grout']) {
      const unitKey = key === 'tileLength' || key === 'tileWidth' ? 'tileUnit' : key === 'grout' ? 'groutUnit' : 'depthUnit';
      if (values[key] !== undefined) {
        const currentUnit = values[unitKey] ?? sourceSmall;
        values[key] = this.convertLength(this.number(values, key), currentUnit, targetSmall);
        values[unitKey] = targetSmall;
      }
    }
    if (values['dimensionUnit'] !== undefined) values['dimensionUnit'] = targetLength;
    if (values['openings'] !== undefined) {
      values['openings'] = this.convertArea(this.number(values, 'openings'), this.number(values, 'openingsUnit'), targetArea);
      values['openingsUnit'] = targetArea;
    }
    if (values['density'] !== undefined) {
      const current = this.number(values, 'density');
      values['density'] = from === 'us' ? current * 0.593276 : current / 0.593276;
      values['densityUnit'] = to === 'us' ? 0 : 1;
    }
    if (values['coverage'] !== undefined) {
      const current = this.number(values, 'coverage');
      values['coverage'] = from === 'us' ? current / 40.745 : current * 40.745;
      values['coverageUnit'] = to === 'us' ? 0 : 1;
    }
    const price = this.number(values, 'price');
    if (price > 0) {
      const kind = this.calculator()?.kind;
      const isMetric = to === 'metric';
      if (kind === 'gravel') {
        const rateFactor = values['priceUnit'] === 1 ? 1 / 0.764554858 : 1.10231131;
        values['price'] = isMetric ? price * rateFactor : price / rateFactor;
      } else if (kind === 'paint') {
        values['price'] = isMetric ? price / 3.785411784 : price * 3.785411784;
      } else if (kind === 'concrete' || kind === 'mulch') {
        values['price'] = isMetric ? price / 0.764554858 : price * 0.764554858;
      }
    }
    this.values.set(values);
    this.areas.update((areas) => areas.map((area) => {
      const targetUnit: AreaEntry['unit'] = to === 'us' ? 'ft' : 'm';
      return {
        length: this.convertAreaLength(area.length, area.unit, targetUnit),
        width: this.convertAreaLength(area.width, area.unit, targetUnit),
        unit: targetUnit,
      };
    }));
    this.result.set(null);
  }

  private localizedFieldLabel(field: Field, system: UnitSystem): string {
    if (system === 'us') return field.label;
    const labels: Record<string, string> = {
      'Price per unit': 'Price per metric tonne or cubic meter',
      'Price per gallon': 'Price per liter',
      'Price per cubic yard': 'Price per cubic meter',
    };
    return labels[field.label] ?? field.label;
  }

  private convertLength(value: number, fromUnit: number, toUnit: number): number {
    const feetByUnit: Record<number, number> = { 0: 1, 1: 1 / 12, 2: 3.280839895, 3: 1 / 30.48, 4: 1 / 304.8 };
    const feet = value * (feetByUnit[fromUnit] ?? 1);
    return feet / (feetByUnit[toUnit] ?? 1);
  }

  private convertArea(value: number, fromUnit: number, toUnit: number): number {
    const sqFtByUnit: Record<number, number> = { 0: 1, 1: 1 / 144, 2: 10.7639104, 3: 1 / 929.0304 };
    const squareFeet = value * (sqFtByUnit[fromUnit] ?? 1);
    return squareFeet / (sqFtByUnit[toUnit] ?? 1);
  }

  private convertAreaLength(value: number, from: AreaEntry['unit'], to: AreaEntry['unit']): number {
    const feetByUnit: Record<AreaEntry['unit'], number> = { ft: 1, in: 1 / 12, m: 3.280839895, cm: 1 / 30.48 };
    return value * feetByUnit[from] / feetByUnit[to];
  }

  private formatRow(row: EstimateRow): string {
    const number = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: row.precision ?? 2,
      maximumFractionDigits: row.precision ?? 2,
    }).format(row.value);
    return row.unit === 'USD' ? `$${number}` : `${number} ${row.unit}`;
  }

  private convertResultRow(row: EstimateRow): EstimateRow {
    if (this.unitPreference.system() === 'us') return row;
    const conversions: Record<string, { label: string; unit: string; factor: number | ((value: number) => number); precision: number }> = {
      'sq ft': { label: row.label, unit: 'sq m', factor: 0.09290304, precision: 2 },
      'sq ft per tile': { label: row.label, unit: 'sq m per tile', factor: 0.09290304, precision: 4 },
      'cu ft': { label: row.label, unit: 'cu m', factor: 0.0283168466, precision: 3 },
      'cu yd': { label: row.label, unit: 'cu m', factor: 0.764554858, precision: 3 },
      'US tons': { label: row.label, unit: 'metric tonnes', factor: 0.90718474, precision: 2 },
      gallons: {
        label: row.label === 'Whole-gallon purchase' ? 'Whole-liter purchase' : row.label,
        unit: row.label === 'Whole-gallon purchase' ? 'L' : 'liters',
        factor: row.label === 'Whole-gallon purchase' ? (value) => Math.ceil(value * 3.785411784) : 3.785411784,
        precision: 2,
      },
    };
    const conversion = conversions[row.unit];
    if (!conversion) return row;
    return {
      ...row,
      label: conversion.label,
      value: typeof conversion.factor === 'number' ? row.value * conversion.factor : conversion.factor(row.value),
      unit: conversion.unit,
      precision: conversion.precision,
    };
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
      densityUnit: this.number(values, 'densityUnit'),
      metricPrice: this.unitPreference.system() === 'metric',
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
      coverageUnit: this.number(values, 'coverageUnit'),
      metricPrice: this.unitPreference.system() === 'metric',
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
      metricPrice: this.unitPreference.system() === 'metric',
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
      metricPrice: this.unitPreference.system() === 'metric',
    };
  }
}

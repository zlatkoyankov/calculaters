export interface EstimateRow {
  label: string;
  value: number;
  unit: string;
  precision?: number;
  detail?: string;
}

export interface Estimate {
  rows: EstimateRow[];
  summary: string;
}

export type Values = Record<string, number>;

export interface GravelInput {
  length: number;
  width: number;
  depth: number;
  density: number;
  waste: number;
  price?: number;
  priceUnit?: number;
}

export interface PaintInput {
  width: number;
  height: number;
  openings: number;
  coats: number;
  coverage: number;
  waste: number;
  price?: number;
}

export interface TileInput {
  length: number;
  width: number;
  tileLength: number;
  tileWidth: number;
  grout: number;
  waste: number;
  boxSize?: number;
  price?: number;
  priceUnit?: number;
}

export interface ConcreteInput {
  length: number;
  width: number;
  depth: number;
  waste: number;
  price?: number;
}

export interface MulchInput {
  length: number;
  width: number;
  depth: number;
  waste: number;
  price?: number;
}

const positive = (value: number, name: string): void => {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} must be greater than zero.`);
};

const nonNegative = (value: number, name: string): void => {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} cannot be negative.`);
};

const wasteMultiplier = (waste: number): number => {
  if (!Number.isFinite(waste) || waste < 0 || waste > 100) throw new Error('Waste allowance must be between 0% and 100%.');
  return 1 + waste / 100;
};

export function calculateGravel(values: GravelInput): Estimate {
  positive(values.length, 'Length');
  positive(values.width, 'Width');
  positive(values.depth, 'Depth');
  nonNegative(values.density, 'Density');
  nonNegative(values.waste, 'Waste allowance');

  const area = values.length * values.width;
  const cubicFeet = area * values.depth / 12;
  const cubicYards = cubicFeet / 27;
  const adjusted = cubicYards * wasteMultiplier(values.waste);
  const tons = values.density > 0 ? adjusted * values.density / 2000 : 0;
  const price = values.price ?? 0;
  nonNegative(price, 'Price');

  const priceUnit = values.priceUnit === 1 ? 'cubic yard' : 'ton';
  const cost = price > 0 ? price * (values.priceUnit === 1 ? adjusted : tons) : null;

  return {
    rows: [
      { label: 'Area', value: area, unit: 'sq ft', precision: 2 },
      { label: 'Base volume', value: cubicFeet, unit: 'cu ft', precision: 2 },
      { label: 'Volume before waste', value: cubicYards, unit: 'cu yd', precision: 2 },
      { label: 'Volume with waste', value: adjusted, unit: 'cu yd', precision: 2 },
      ...(tons > 0 ? [{ label: 'Estimated weight', value: tons, unit: 'US tons', precision: 2 }] : []),
      ...(cost !== null ? [{ label: 'Estimated material cost', value: cost, unit: 'USD', precision: 2, detail: `at $${price.toFixed(2)} per ${priceUnit}` }] : []),
    ],
    summary: `${adjusted.toFixed(2)} cubic yards${tons > 0 ? ` (about ${tons.toFixed(2)} US tons)` : ''} including waste.`,
  };
}

export function calculatePaint(values: PaintInput): Estimate {
  positive(values.width, 'Wall width');
  positive(values.height, 'Wall height');
  positive(values.coats, 'Number of coats');
  positive(values.coverage, 'Coverage');
  nonNegative(values.openings, 'Excluded area');
  nonNegative(values.waste, 'Waste allowance');

  const gross = values.width * values.height;
  if (values.openings > gross) throw new Error('Excluded area cannot exceed gross wall area.');

  const net = gross - values.openings;
  const coverArea = net * values.coats * wasteMultiplier(values.waste);
  const gallons = coverArea / values.coverage;
  const price = values.price ?? 0;
  nonNegative(price, 'Price');

  return {
    rows: [
      { label: 'Gross wall area', value: gross, unit: 'sq ft', precision: 2 },
      { label: 'Area excluded', value: values.openings, unit: 'sq ft', precision: 2 },
      { label: 'Net wall area', value: net, unit: 'sq ft', precision: 2 },
      { label: 'Coverage across coats', value: coverArea, unit: 'sq ft', precision: 2 },
      { label: 'Estimated paint', value: gallons, unit: 'gallons', precision: 2 },
      { label: 'Whole-gallon purchase', value: Math.ceil(gallons), unit: 'gallons', precision: 0, detail: 'rounded up for purchasing' },
      ...(price > 0 ? [{ label: 'Estimated cost', value: Math.ceil(gallons) * price, unit: 'USD', precision: 2 }] : []),
    ],
    summary: `Plan for ${Math.ceil(gallons)} gallon${Math.ceil(gallons) === 1 ? '' : 's'} for this estimate.`,
  };
}

export function calculateTile(values: TileInput): Estimate {
  positive(values.length, 'Room length');
  positive(values.width, 'Room width');
  positive(values.tileLength, 'Tile length');
  positive(values.tileWidth, 'Tile width');
  nonNegative(values.grout, 'Grout spacing');
  nonNegative(values.waste, 'Waste allowance');

  const roomArea = values.length * values.width;
  const tileFace = (values.tileLength + values.grout) * (values.tileWidth + values.grout) / 144;
  const rawTiles = roomArea / tileFace * wasteMultiplier(values.waste);
  const tiles = Math.ceil(rawTiles);
  const boxes = (values.boxSize ?? 0) > 0 ? Math.ceil(tiles / (values.boxSize ?? 0)) : 0;
  const price = values.price ?? 0;
  nonNegative(price, 'Price');
  const cost = price > 0 ? price * (values.priceUnit === 1 && boxes > 0 ? boxes : tiles) : null;

  return {
    rows: [
      { label: 'Room area', value: roomArea, unit: 'sq ft', precision: 2 },
      { label: 'Approx. tile coverage', value: tileFace, unit: 'sq ft per tile', precision: 3, detail: 'including grout spacing' },
      { label: 'Estimated tiles', value: tiles, unit: 'tiles', precision: 0, detail: 'includes waste allowance' },
      ...(boxes > 0 ? [{ label: 'Estimated boxes', value: boxes, unit: 'boxes', precision: 0 }] : []),
      ...(cost !== null ? [{ label: 'Estimated material cost', value: cost, unit: 'USD', precision: 2 }] : []),
    ],
    summary: `Plan for ${tiles} tiles${boxes > 0 ? ` or ${boxes} boxes` : ''}, including waste.`,
  };
}

export function calculateConcrete(values: ConcreteInput): Estimate {
  positive(values.length, 'Slab length');
  positive(values.width, 'Slab width');
  positive(values.depth, 'Thickness');
  nonNegative(values.waste, 'Waste allowance');

  const area = values.length * values.width;
  const cubicFeet = area * values.depth / 12;
  const cubicYards = cubicFeet / 27;
  const adjusted = cubicYards * wasteMultiplier(values.waste);
  const price = values.price ?? 0;
  nonNegative(price, 'Price');

  return {
    rows: [
      { label: 'Slab area', value: area, unit: 'sq ft', precision: 2 },
      { label: 'Volume', value: cubicFeet, unit: 'cu ft', precision: 2 },
      { label: 'Volume before waste', value: cubicYards, unit: 'cu yd', precision: 2 },
      { label: 'Volume with waste', value: adjusted, unit: 'cu yd', precision: 2 },
      ...(price > 0 ? [{ label: 'Estimated material cost', value: adjusted * price, unit: 'USD', precision: 2 }] : []),
    ],
    summary: `${adjusted.toFixed(2)} cubic yards including waste.`,
  };
}

export function calculateArea(areas: { length: number; width: number; unit: 'ft' | 'in' }[]): Estimate {
  if (areas.length === 0) throw new Error('Add at least one area.');
  const totals = areas.map((area, index) => {
    positive(area.length, `Area ${index + 1} length`);
    positive(area.width, `Area ${index + 1} width`);
    const factor = area.unit === 'in' ? 1 / 12 : 1;
    return area.length * factor * area.width * factor;
  });
  const total = totals.reduce((sum, value) => sum + value, 0);
  return {
    rows: [
      ...totals.map((value, index) => ({ label: `Area ${index + 1}`, value, unit: 'sq ft', precision: 2 })),
      { label: 'Combined area', value: total, unit: 'sq ft', precision: 2 },
      { label: 'Metric equivalent', value: total * 0.09290304, unit: 'sq m', precision: 2 },
    ],
    summary: `${total.toFixed(2)} square feet combined.`,
  };
}

export function calculateMulch(values: MulchInput): Estimate {
  positive(values.length, 'Length');
  positive(values.width, 'Width');
  positive(values.depth, 'Depth');
  nonNegative(values.waste, 'Waste allowance');

  const area = values.length * values.width;
  const cubicFeet = area * values.depth / 12;
  const cubicYards = cubicFeet / 27;
  const adjusted = cubicYards * wasteMultiplier(values.waste);
  const price = values.price ?? 0;
  nonNegative(price, 'Price');

  return {
    rows: [
      { label: 'Area', value: area, unit: 'sq ft', precision: 2 },
      { label: 'Volume', value: cubicFeet, unit: 'cu ft', precision: 2 },
      { label: 'Volume before waste', value: cubicYards, unit: 'cu yd', precision: 2 },
      { label: 'Volume with waste', value: adjusted, unit: 'cu yd', precision: 2 },
      ...(price > 0 ? [{ label: 'Estimated material cost', value: adjusted * price, unit: 'USD', precision: 2 }] : []),
    ],
    summary: `${adjusted.toFixed(2)} cubic yards including waste.`,
  };
}

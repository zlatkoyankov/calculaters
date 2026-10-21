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
  dimensionUnit?: number;
  depthUnit?: number;
  densityUnit?: number;
  metricPrice?: boolean;
}

export interface PaintInput {
  width: number;
  height: number;
  openings: number;
  coats: number;
  coverage: number;
  waste: number;
  price?: number;
  dimensionUnit?: number;
  openingsUnit?: number;
  coverageUnit?: number;
  metricPrice?: boolean;
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
  dimensionUnit?: number;
  tileUnit?: number;
  groutUnit?: number;
}

export interface ConcreteInput {
  length: number;
  width: number;
  depth: number;
  waste: number;
  price?: number;
  dimensionUnit?: number;
  depthUnit?: number;
  metricPrice?: boolean;
}

export interface MulchInput {
  length: number;
  width: number;
  depth: number;
  waste: number;
  price?: number;
  dimensionUnit?: number;
  depthUnit?: number;
  metricPrice?: boolean;
}

const FEET_PER_UNIT = [1, 1 / 12, 3.280839895, 1 / 30.48, 1 / 304.8];
const INCHES_PER_UNIT = [12, 1, 39.37007874, 1 / 2.54, 1 / 25.4];
const SQUARE_FEET_PER_UNIT = [1, 1 / 144, 10.7639104, 1 / 929.0304];
const unitFactor = (factors: number[], unit: number | undefined): number => factors[unit ?? 0] ?? 1;

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

  const dimensionFactor = unitFactor(FEET_PER_UNIT, values.dimensionUnit);
  const depthInches = values.depth * unitFactor(INCHES_PER_UNIT, values.depthUnit ?? 1);
  const lengthFeet = values.length * dimensionFactor;
  const widthFeet = values.width * dimensionFactor;
  const area = lengthFeet * widthFeet;
  const cubicFeet = area * depthInches / 12;
  const cubicYards = cubicFeet / 27;
  const adjusted = cubicYards * wasteMultiplier(values.waste);
  const density = values.densityUnit === 1 ? values.density / 0.593276 : values.density;
  const tons = density > 0 ? adjusted * density / 2000 : 0;
  const price = values.price ?? 0;
  nonNegative(price, 'Price');

  const metricVolume = adjusted * 0.764554858;
  const metricDensity = values.densityUnit === 1 ? values.density : values.density / 0.593276;
  const priceUnit = values.priceUnit === 1
    ? values.metricPrice ? 'cubic meter' : 'cubic yard'
    : values.metricPrice ? 'metric tonne' : 'ton';
  const priceQuantity = values.priceUnit === 1
    ? values.metricPrice ? metricVolume : adjusted
    : values.metricPrice ? metricVolume * metricDensity / 1000 : tons;
  const cost = price > 0 ? price * priceQuantity : null;

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

  const dimensionFactor = unitFactor(FEET_PER_UNIT, values.dimensionUnit);
  const gross = values.width * dimensionFactor * values.height * dimensionFactor;
  const openings = values.openings * unitFactor(SQUARE_FEET_PER_UNIT, values.openingsUnit);
  if (openings > gross) throw new Error('Excluded area cannot exceed gross wall area.');

  const net = gross - openings;
  const coverArea = net * values.coats * wasteMultiplier(values.waste);
  const coverage = values.coverageUnit === 1 ? values.coverage * 40.745 : values.coverage;
  const gallons = coverArea / coverage;
  const metricLiters = gallons * 3.785411784;
  const purchaseQuantity = values.metricPrice ? Math.ceil(metricLiters) : Math.ceil(gallons);
  const price = values.price ?? 0;
  nonNegative(price, 'Price');

  return {
    rows: [
      { label: 'Gross wall area', value: gross, unit: 'sq ft', precision: 2 },
      { label: 'Area excluded', value: openings, unit: 'sq ft', precision: 2 },
      { label: 'Net wall area', value: net, unit: 'sq ft', precision: 2 },
      { label: 'Coverage across coats', value: coverArea, unit: 'sq ft', precision: 2 },
      { label: 'Estimated paint', value: gallons, unit: 'gallons', precision: 2 },
      { label: 'Whole-gallon purchase', value: Math.ceil(gallons), unit: 'gallons', precision: 0, detail: 'rounded up for purchasing' },
      ...(price > 0 ? [{ label: 'Estimated cost', value: purchaseQuantity * price, unit: 'USD', precision: 2 }] : []),
    ],
    summary: values.metricPrice
      ? `Plan for ${purchaseQuantity} liters for this estimate.`
      : `Plan for ${purchaseQuantity} gallon${purchaseQuantity === 1 ? '' : 's'} for this estimate.`,
  };
}

export function calculateTile(values: TileInput): Estimate {
  positive(values.length, 'Room length');
  positive(values.width, 'Room width');
  positive(values.tileLength, 'Tile length');
  positive(values.tileWidth, 'Tile width');
  nonNegative(values.grout, 'Grout spacing');
  nonNegative(values.waste, 'Waste allowance');

  const dimensionFactor = unitFactor(FEET_PER_UNIT, values.dimensionUnit);
  const roomArea = values.length * dimensionFactor * values.width * dimensionFactor;
  const tileInches = unitFactor(INCHES_PER_UNIT, values.tileUnit ?? 1);
  const groutInches = unitFactor(INCHES_PER_UNIT, values.groutUnit ?? 1);
  const tileFace = (values.tileLength * tileInches + values.grout * groutInches)
    * (values.tileWidth * tileInches + values.grout * groutInches) / 144;
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

  const dimensionFactor = unitFactor(FEET_PER_UNIT, values.dimensionUnit);
  const depthInches = values.depth * unitFactor(INCHES_PER_UNIT, values.depthUnit ?? 1);
  const area = values.length * dimensionFactor * values.width * dimensionFactor;
  const cubicFeet = area * depthInches / 12;
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
      ...(price > 0 ? [{ label: 'Estimated material cost', value: adjusted * (values.metricPrice ? 0.764554858 : 1) * price, unit: 'USD', precision: 2 }] : []),
    ],
    summary: `${adjusted.toFixed(2)} cubic yards including waste.`,
  };
}

export function calculateArea(areas: { length: number; width: number; unit: 'ft' | 'in' | 'm' | 'cm' }[]): Estimate {
  if (areas.length === 0) throw new Error('Add at least one area.');
  const totals = areas.map((area, index) => {
    positive(area.length, `Area ${index + 1} length`);
    positive(area.width, `Area ${index + 1} width`);
    const factor = area.unit === 'ft' ? 1 : area.unit === 'in' ? 1 / 12 : area.unit === 'm' ? 3.280839895 : 1 / 30.48;
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

  const dimensionFactor = unitFactor(FEET_PER_UNIT, values.dimensionUnit);
  const depthInches = values.depth * unitFactor(INCHES_PER_UNIT, values.depthUnit ?? 1);
  const area = values.length * dimensionFactor * values.width * dimensionFactor;
  const cubicFeet = area * depthInches / 12;
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
      ...(price > 0 ? [{ label: 'Estimated material cost', value: adjusted * (values.metricPrice ? 0.764554858 : 1) * price, unit: 'USD', precision: 2 }] : []),
    ],
    summary: `${adjusted.toFixed(2)} cubic yards including waste.`,
  };
}

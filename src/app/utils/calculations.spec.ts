import {
  calculateArea, calculateConcrete, calculateGravel, calculateMulch, calculatePaint, calculateTile,
} from './calculations';

describe('calculation utilities', () => {
  it('converts gravel volume and density to tons', () => {
    const result = calculateGravel({
      length: 20, width: 10, depth: 3, density: 2700, waste: 10, price: 0, priceUnit: 0,
    });
    const volume = result.rows.find((row) => row.label === 'Volume with waste');
    const tons = result.rows.find((row) => row.label === 'Estimated weight');
    expect(volume?.value).toBeCloseTo(2.04, 2);
    expect(tons?.value).toBeCloseTo(2.75, 2);
  });

  it('computes paint coverage and rounds gallons up', () => {
    const result = calculatePaint({
      width: 12, height: 8, openings: 20, coats: 2, coverage: 350, waste: 0, price: 40,
    });
    const gallons = result.rows.find((row) => row.label === 'Estimated paint');
    const purchase = result.rows.find((row) => row.label === 'Whole-gallon purchase');
    const cost = result.rows.find((row) => row.label === 'Estimated cost');
    expect(gallons?.value).toBeCloseTo(0.4342857, 6);
    expect(purchase?.value).toBe(1);
    expect(cost?.value).toBe(40);
  });

  it('computes tile quantities and rounds packages', () => {
    const result = calculateTile({
      length: 10, width: 12, tileLength: 12, tileWidth: 12, grout: 0.125, waste: 10, boxSize: 10, price: 0, priceUnit: 0,
    });
    const tiles = result.rows.find((row) => row.label === 'Estimated tiles');
    const boxes = result.rows.find((row) => row.label === 'Estimated boxes');
    expect(tiles?.value).toBeGreaterThanOrEqual(130);
    expect(boxes?.value).toBe(Math.ceil((tiles?.value ?? 0) / 10));
  });

  it('converts concrete cubic feet to cubic yards', () => {
    const result = calculateConcrete({
      length: 10, width: 10, depth: 4, waste: 0, price: 0,
    });
    const cubicFeet = result.rows.find((row) => row.label === 'Volume');
    const cubicYards = result.rows.find((row) => row.label === 'Volume before waste');
    expect(cubicFeet?.value).toBeCloseTo(33.3333, 3);
    expect(cubicYards?.value).toBeCloseTo(1.2346, 3);
  });

  it('totals square footage across multiple rooms', () => {
    const result = calculateArea([
      { length: 12, width: 10, unit: 'ft' },
      { length: 120, width: 120, unit: 'in' },
    ]);
    const combined = result.rows.find((row) => row.label === 'Combined area');
    expect(combined?.value).toBeCloseTo(220, 4);
  });

  it('converts mulch depth to cubic yards', () => {
    const result = calculateMulch({
      length: 10, width: 10, depth: 3, waste: 10, price: 0,
    });
    const cubicYards = result.rows.find((row) => row.label === 'Volume with waste');
    expect(cubicYards?.value).toBeCloseTo(1.0185, 3);
  });

  it('applies waste allowance consistently', () => {
    const noWaste = calculateConcrete({ length: 10, width: 10, depth: 4, waste: 0, price: 0 });
    const withWaste = calculateConcrete({ length: 10, width: 10, depth: 4, waste: 10, price: 0 });
    const base = noWaste.rows.find((row) => row.label === 'Volume before waste')?.value ?? 0;
    const adjusted = withWaste.rows.find((row) => row.label === 'Volume with waste')?.value ?? 0;
    expect(adjusted).toBeCloseTo(base * 1.1, 6);
  });

  it('normalizes metric measurements before estimating', () => {
    const imperial = calculateConcrete({ length: 10, width: 10, depth: 4, waste: 0, price: 0 });
    const metric = calculateConcrete({
      length: 3.048, width: 3.048, depth: 10.16, waste: 0, price: 0, dimensionUnit: 2, depthUnit: 3,
    });
    const imperialVolume = imperial.rows.find((row) => row.label === 'Volume before waste')?.value;
    const metricVolume = metric.rows.find((row) => row.label === 'Volume before waste')?.value;
    expect(metricVolume).toBeCloseTo(imperialVolume ?? 0, 6);
  });

  it('supports metric gravel density and paint coverage inputs', () => {
    const gravel = calculateGravel({
      length: 6.096, width: 3.048, depth: 7.62, density: 1600, waste: 10,
      dimensionUnit: 2, depthUnit: 3, densityUnit: 1,
    });
    const volume = gravel.rows.find((row) => row.label === 'Volume with waste')?.value;
    const weight = gravel.rows.find((row) => row.label === 'Estimated weight')?.value;
    expect(volume).toBeCloseTo(2.04, 2);
    expect(weight).toBeCloseTo(2.75, 1);

    const paint = calculatePaint({
      width: 3.6576, height: 2.4384, openings: 1.858, coats: 2,
      coverage: 8.59, waste: 0, dimensionUnit: 2, openingsUnit: 2, coverageUnit: 1,
    });
    const gallons = paint.rows.find((row) => row.label === 'Estimated paint')?.value;
    expect(gallons).toBeCloseTo(0.434, 2);
  });

  it('throws for zero, negative, missing, or invalid inputs', () => {
    expect(() => calculateConcrete({ length: 0, width: 10, depth: 4, waste: 0, price: 0 })).toThrow();
    expect(() => calculatePaint({ width: 10, height: 8, openings: 1000, coats: 2, coverage: 350, waste: 0, price: 0 })).toThrow();
    expect(() => calculateArea([{ length: -2, width: 5, unit: 'ft' }])).toThrow();
    expect(() => calculateMulch({ length: 10, width: 10, depth: Number.NaN, waste: 0, price: 0 })).toThrow();
  });

  it('reports a metric paint purchase in whole liters that matches the cost basis', () => {
    const result = calculatePaint({
      width: 12, height: 8, openings: 0, coats: 2, coverage: 350, waste: 0, price: 10, metricPrice: true,
    });
    const purchase = result.rows.find((row) => row.label === 'Whole-liter purchase');
    const cost = result.rows.find((row) => row.label === 'Estimated cost');
    expect(purchase?.value).toBe(3);
    expect(purchase?.unit).toBe('L');
    expect(cost?.value).toBe(30);
    expect(result.rows.some((row) => row.label === 'Whole-gallon purchase')).toBe(false);
  });

  it('rejects pricing by the box without a box size and negative box sizes', () => {
    const base = { length: 10, width: 12, tileLength: 12, tileWidth: 12, grout: 0.125, waste: 10 };
    expect(() => calculateTile({ ...base, boxSize: 0, price: 5, priceUnit: 1 })).toThrow(/tiles per box/i);
    expect(() => calculateTile({ ...base, boxSize: -4 })).toThrow();
    expect(calculateTile({ ...base, boxSize: 10, price: 5, priceUnit: 1 }).rows.find((row) => row.label === 'Estimated material cost')?.value).toBe(65);
  });

  it('converts centimeter and millimeter inputs to the same estimate as inches', () => {
    const inches = calculateTile({ length: 10, width: 12, tileLength: 12, tileWidth: 12, grout: 0.125, waste: 0 });
    const millimeters = calculateTile({
      length: 10, width: 12, tileLength: 304.8, tileWidth: 304.8, grout: 3.175, waste: 0, tileUnit: 4, groutUnit: 4,
    });
    expect(millimeters.rows.find((row) => row.label === 'Estimated tiles')?.value)
      .toBe(inches.rows.find((row) => row.label === 'Estimated tiles')?.value);
  });
});

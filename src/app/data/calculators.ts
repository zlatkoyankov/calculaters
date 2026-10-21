export type CalculatorKind = 'gravel' | 'paint' | 'tile' | 'concrete' | 'area' | 'mulch';

export interface CalculatorInfo {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  intro: string;
  kind: CalculatorKind;
  icon: string;
  keywords: string[];
  example: string;
  formula: string;
  faqs: { question: string; answer: string }[];
}

export const CALCULATORS: CalculatorInfo[] = [
  {
    slug: 'gravel-calculator', title: 'Gravel Calculator', shortTitle: 'Gravel', category: 'Landscaping',
    description: 'Estimate gravel volume, weight, and material cost for a driveway, path, or garden bed.',
    intro: 'Plan a gravel delivery with a practical estimate of volume and weight. Enter your project dimensions and adjust the example density to match your supplier’s material.',
    kind: 'gravel', icon: 'gravel', keywords: ['stone', 'driveway', 'aggregate', 'rock', 'tons'],
    example: 'A 20 ft × 10 ft area at 3 in deep holds about 1.85 cubic yards before waste.',
    formula: 'Length × width gives area. Area × depth in feet gives cubic feet; divide by 27 for cubic yards. Weight uses your entered density, and waste is added to volume.',
    faqs: [
      { question: 'How much does a cubic yard of gravel weigh?', answer: 'It varies by aggregate, grading, moisture, and compaction. Use a supplier-provided density for a better weight estimate; the default is only an example.' },
      { question: 'How much extra gravel should I order?', answer: 'A waste allowance can account for uneven ground and handling. The right amount depends on site conditions, so confirm your depth and quantity with the supplier.' },
    ],
  },
  {
    slug: 'paint-calculator', title: 'Paint Calculator', shortTitle: 'Paint', category: 'Painting',
    description: 'Estimate paint coverage and the number of gallons needed for your walls.',
    intro: 'Estimate paint for rectangular walls, subtract doors and windows, and plan for multiple coats. Check the label for the coverage of your exact paint.',
    kind: 'paint', icon: 'paint', keywords: ['walls', 'gallons', 'coverage', 'painting', 'coats'],
    example: 'A 12 ft × 8 ft wall is 96 square feet before subtracting openings.',
    formula: 'Net wall area × coats ÷ coverage per gallon = estimated gallons. Whole-gallon purchasing rounds that quantity up.',
    faqs: [
      { question: 'How many coats of paint should I plan for?', answer: 'Two coats are common, but coverage depends on color change, surface condition, primer, and the product. Follow the paint manufacturer’s instructions.' },
      { question: 'Does the calculator include ceilings and trim?', answer: 'No. Add each wall area to the dimensions and openings inputs as appropriate; ceilings, trim, and unusual surfaces need separate estimates.' },
    ],
  },
  {
    slug: 'tile-calculator', title: 'Tile Calculator', shortTitle: 'Tile', category: 'Flooring & Tile',
    description: 'Calculate approximate tile quantity and boxes for a rectangular floor or wall.',
    intro: 'Estimate tiles for a simple rectangular layout, including a configurable waste allowance. Complex patterns and irregular spaces require additional planning.',
    kind: 'tile', icon: 'tile', keywords: ['floor', 'bathroom', 'boxes', 'ceramic', 'backsplash'],
    example: 'A 10 ft × 12 ft room has 120 square feet of floor area before waste.',
    formula: 'Room area ÷ tile face area gives the base tile count. Apply waste, then round tiles and boxes up to whole units.',
    faqs: [
      { question: 'Does tile spacing change the estimate?', answer: 'Grout spacing is included as an approximate addition to each tile’s face dimensions. Real layouts can differ at edges and around cuts.' },
      { question: 'Does this estimate account for tile patterns?', answer: 'No. The estimate is for a basic rectangular layout and does not account for diagonal layouts, intricate patterns, or irregular rooms.' },
    ],
  },
  {
    slug: 'concrete-calculator', title: 'Concrete Calculator', shortTitle: 'Concrete', category: 'Concrete & Masonry',
    description: 'Estimate concrete volume for a slab and optionally calculate material cost.',
    intro: 'Estimate the volume of concrete for a rectangular slab. The result is a planning estimate, not a structural design or placement specification.',
    kind: 'concrete', icon: 'concrete', keywords: ['slab', 'cement', 'patio', 'cubic yards', 'foundation'],
    example: 'A 10 ft × 10 ft slab that is 4 in thick is about 1.23 cubic yards before waste.',
    formula: 'Length × width × thickness in feet gives cubic feet; divide by 27 to convert to cubic yards. Apply waste to the volume.',
    faqs: [
      { question: 'How much concrete should I order?', answer: 'Use the adjusted volume as a starting estimate, then confirm the order quantity with your concrete supplier and account for site conditions.' },
      { question: 'Does this calculator size a foundation?', answer: 'No. It estimates volume only and does not replace structural engineering, code requirements, reinforcement design, or local construction guidance.' },
    ],
  },
  {
    slug: 'square-footage-calculator', title: 'Square Footage Calculator', shortTitle: 'Square footage', category: 'General Construction',
    description: 'Add multiple rectangular rooms or spaces to find their combined square footage.',
    intro: 'Add rectangular areas one at a time to total a home, room, or project footprint. Choose feet or inches for each measurement.',
    kind: 'area', icon: 'area', keywords: ['room', 'square feet', 'floor area', 'measurement', 'square meters'],
    example: 'A 12 ft × 10 ft room is 120 square feet.',
    formula: 'For each rectangle, multiply length by width. Convert inch measurements to feet first, then add each area.',
    faqs: [
      { question: 'Can I combine several rooms?', answer: 'Yes. Add a separate row for each rectangular space; the total is the sum of all room areas.' },
      { question: 'Does this handle L-shaped rooms?', answer: 'Not directly. Divide an irregular room into non-overlapping rectangles and add each section as a separate area.' },
    ],
  },
  {
    slug: 'mulch-calculator', title: 'Mulch Calculator', shortTitle: 'Mulch', category: 'Landscaping',
    description: 'Estimate mulch volume for garden beds and landscaping areas.',
    intro: 'Estimate mulch in cubic feet and cubic yards from the bed dimensions and planned depth. Depth recommendations vary by material and use.',
    kind: 'mulch', icon: 'mulch', keywords: ['garden', 'landscape', 'cubic yards', 'bark', 'beds'],
    example: 'A 10 ft × 10 ft bed at 3 in deep holds about 0.93 cubic yards before waste.',
    formula: 'Length × width gives area. Multiply by depth in feet for cubic feet, divide by 27 for cubic yards, then apply waste.',
    faqs: [
      { question: 'What mulch depth should I use?', answer: 'The appropriate depth depends on mulch type, plants, and the purpose of the layer. Follow local horticultural guidance and avoid piling mulch against stems or trunks.' },
      { question: 'How many bags are in a cubic yard?', answer: 'Bag volumes vary. Divide the required cubic feet by the volume printed on the bag to estimate the number of bags, rounding up.' },
    ],
  },
];

export const FEATURED_SLUGS = [
  'gravel-calculator', 'paint-calculator', 'tile-calculator',
  'concrete-calculator', 'square-footage-calculator', 'mulch-calculator',
];

export const CATEGORIES = [...new Set(CALCULATORS.map((calculator) => calculator.category))];

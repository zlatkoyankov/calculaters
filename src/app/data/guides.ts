export interface GuideSection {
  title: string;
  paragraphs: string[];
}

export interface Guide {
  slug: string;
  calculatorSlug: string;
  kind: string;
  title: string;
  shortTitle: string;
  kicker: string;
  intro: string;
  description: string;
  sections: GuideSection[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'gravel-calculator-guide', calculatorSlug: 'gravel-calculator', kind: 'gravel',
    title: 'Gravel estimating guide', shortTitle: 'Gravel', kicker: 'LANDSCAPING MATERIALS',
    intro: 'A dependable gravel estimate starts with measured dimensions and product information from your supplier.',
    description: 'Learn how to estimate gravel volume and weight, verify material density, and plan a supplier order.',
    sections: [
      { title: 'Measure the area and depth', paragraphs: ['Measure length and width in feet and determine the planned compacted or finished depth. Convert inches to feet when calculating volume. For irregular areas, divide the space into rectangles and total their areas.', 'The calculator converts cubic feet to cubic yards by dividing by 27. Add an allowance only after considering ground preparation, edging, compaction, and how material will be spread.'] },
      { title: 'Confirm the material density', paragraphs: ['Different aggregates do not have one universal weight per cubic yard. Gradation, moisture, and compaction affect density. Ask the supplier for an estimate for the specific product and use it instead of a generic reference value.', 'A calculator’s ton estimate is only as accurate as the density entered. Verify weight limits, delivery conditions, and order increments with the supplier.'] },
    ],
  },
  {
    slug: 'paint-calculator-guide', calculatorSlug: 'paint-calculator', kind: 'paint',
    title: 'Paint estimating guide', shortTitle: 'Paint', kicker: 'PAINTING PROJECTS',
    intro: 'Estimate paint from your wall dimensions, the number of coats, and the coverage listed for your chosen product.',
    description: 'Learn how to estimate wall paint from dimensions, coats, product coverage, and surface conditions.',
    sections: [
      { title: 'Measure surfaces consistently', paragraphs: ['For rectangular walls, multiply width by height. Subtract the area of large doors and windows when useful; small openings can be left in the total to provide a modest allowance.', 'Add walls individually for a room. Ceilings, trim, cabinets, and textured surfaces need separate measurements and may have different coverage.'] },
      { title: 'Use product-specific coverage', paragraphs: ['Coverage varies by paint formulation, surface texture, porosity, color change, and application method. Read the label and consider primer or additional coats where the manufacturer recommends them.', 'The purchase estimate rounds gallons up to whole gallons. Compare the estimated coverage with available package sizes and confirm your plan with the product instructions.'] },
    ],
  },
  {
    slug: 'tile-calculator-guide', calculatorSlug: 'tile-calculator', kind: 'tile',
    title: 'Tile estimating guide', shortTitle: 'Tile', kicker: 'FLOORING & TILE',
    intro: 'Tile quantities depend on the area, the tile size, the grout joint and how much material is lost to cuts.',
    description: 'Learn how to estimate floor or wall tile, account for grout joints and cuts, and round up to whole boxes.',
    sections: [
      { title: 'Start with the surface area', paragraphs: ['Measure the length and width of the floor or wall and multiply them to get the area. For L-shaped or irregular rooms, split the space into rectangles and add them together.', 'Use the finished tile layout in mind: tile around a tub, a doorway or a built-in cabinet is not needed, but small cutouts are usually simpler to leave in the total as part of your allowance.'] },
      { title: 'Allow for cuts and waste', paragraphs: ['Tiles are cut at walls and around fixtures, and some will break or have flaws. Many installers add a modest allowance, and a larger one for diagonal, herringbone or patterned layouts. The right figure depends on your layout and the tile.', 'Keep a few spare tiles from the same production lot. Color and size can vary slightly between lots, which makes later repairs hard to match.'] },
      { title: 'Convert to whole boxes', paragraphs: ['Tile is sold in boxes that cover a stated area or hold a set number of pieces. Divide the tiles you need by the number per box and round up, because partial boxes are not sold.', 'Check the box label for coverage and ask your supplier about returns on unopened boxes before you order.'] },
    ],
  },
  {
    slug: 'concrete-calculator-guide', calculatorSlug: 'concrete-calculator', kind: 'concrete',
    title: 'Concrete estimating guide', shortTitle: 'Concrete', kicker: 'CONCRETE & MASONRY',
    intro: 'A slab estimate is a volume calculation. Getting the thickness, the units and the allowance right avoids a short or an expensive over-order.',
    description: 'Learn how to estimate concrete for a slab in cubic yards, convert units correctly, and plan an allowance with your supplier.',
    sections: [
      { title: 'Calculate volume in cubic yards', paragraphs: ['Multiply length, width and thickness, all in feet, to get cubic feet. Divide by 27 to convert to cubic yards, which is how ready-mix concrete is usually ordered in the United States.', 'Thickness is usually given in inches. Divide by 12 first. A 10 ft by 10 ft slab that is 4 in thick is about 1.23 cubic yards before any allowance.'] },
      { title: 'Plan for uneven ground and spillage', paragraphs: ['Subgrades are rarely perfectly level, forms can shift, and some concrete stays in the truck or is lost during placement. A modest allowance helps cover this, and your supplier can advise what is typical for your job.', 'Thicker edges, footings or reinforcement can change the volume. Add those sections separately.'] },
      { title: 'What this estimate does not cover', paragraphs: ['This is a volume estimate only. It does not design the slab, choose a mix, or replace local code, reinforcement or engineering requirements.', 'Confirm the mix, delivery minimums and placement details with a qualified supplier or contractor before ordering.'] },
    ],
  },
  {
    slug: 'square-footage-calculator-guide', calculatorSlug: 'square-footage-calculator', kind: 'area',
    title: 'Square footage measuring guide', shortTitle: 'Square footage', kicker: 'GENERAL CONSTRUCTION',
    intro: 'Almost every material estimate starts with area. Measuring consistently and breaking a space into simple shapes keeps it accurate.',
    description: 'Learn how to measure rooms, break irregular spaces into rectangles, and convert between square feet and square meters.',
    sections: [
      { title: 'Break the space into rectangles', paragraphs: ['Multiply length by width for each rectangular area, then add the areas together. An L-shaped room is two rectangles. A room with an alcove is a main rectangle plus a smaller one.', 'Measure each dimension at its longest point and write the numbers down as you go, so none are lost.'] },
      { title: 'Keep units consistent', paragraphs: ['Do not mix feet and inches in one multiplication. Convert inches to feet by dividing by 12, or measure everything in the same unit before multiplying.', 'One square meter is about 10.76 square feet. BuildCalc lets you work in either system and converts the result for you.'] },
      { title: 'Use the area for the next step', paragraphs: ['Area is the input for flooring, paint, tile and many other materials. Check the product’s stated coverage and add an allowance for cuts and waste appropriate to the material.', 'Measurements taken on site are better than plans, which may not match what was actually built.'] },
    ],
  },
  {
    slug: 'mulch-calculator-guide', calculatorSlug: 'mulch-calculator', kind: 'mulch',
    title: 'Mulch estimating guide', shortTitle: 'Mulch', kicker: 'LANDSCAPING MATERIALS',
    intro: 'Mulch is sold by volume. Bed area and depth determine how many cubic yards you need.',
    description: 'Learn how to estimate mulch in cubic yards from bed area and depth, and how much to order for garden beds.',
    sections: [
      { title: 'Area times depth', paragraphs: ['Measure the length and width of each bed, multiply them for the area, then multiply by the depth in feet. Divide the cubic feet by 27 for cubic yards.', 'A common mulch depth is about 2 to 3 inches, but the right depth depends on the mulch type and the plants. Check the guidance for what you are growing.'] },
      { title: 'Bags or bulk', paragraphs: ['Bagged mulch is convenient for small beds and is labeled by volume. Bulk delivery is usually cheaper per cubic yard for larger areas, though delivery minimums apply.', 'Compare the price per cubic foot or yard, not per bag, because bag sizes vary.'] },
      { title: 'Account for curves and settling', paragraphs: ['Curved beds and trees are easier to estimate as simple rectangles with a small allowance. Mulch also settles and breaks down over time, so a small extra amount helps for later top-ups.', 'Keep mulch away from trunks and stems as recommended by gardening guidance.'] },
    ],
  },
];

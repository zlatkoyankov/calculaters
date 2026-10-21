import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CALCULATORS } from '../data/calculators';

interface ContentSection {
  title: string;
  paragraphs: string[];
}

interface PageContent {
  title: string;
  kicker: string;
  intro: string;
  sections: ContentSection[];
}

const PAGES: Record<string, PageContent> = {
  guides: {
    title: 'Material guides', kicker: 'PROJECT KNOW-HOW',
    intro: 'Understand the assumptions behind common material estimates and learn what to confirm before placing an order.',
    sections: [
      { title: 'Gravel planning guide', paragraphs: ['Gravel is sold by weight or volume, and the conversion depends on the material’s density and moisture. Measure the area and planned depth, then ask your supplier for the product’s approximate density and delivery units.', 'For uneven or newly prepared ground, consider an allowance for settling, grading, and handling. Confirm the final quantity with the supplier before ordering.'] },
      { title: 'Paint planning guide', paragraphs: ['Start with the surface area, subtract large openings, and account for every coat. Coverage on the can is a guide; porous, textured, or previously unpainted surfaces may use more paint.', 'Check the label for the product and surface you plan to paint. Keep a little matching paint for touch-ups when practical.'] },
    ],
  },
  'gravel-calculator-guide': {
    title: 'Gravel estimating guide', kicker: 'LANDSCAPING MATERIALS',
    intro: 'A dependable gravel estimate starts with measured dimensions and product information from your supplier.',
    sections: [
      { title: 'Measure the area and depth', paragraphs: ['Measure length and width in feet and determine the planned compacted or finished depth. Convert inches to feet when calculating volume. For irregular areas, divide the space into rectangles and total their areas.', 'The calculator converts cubic feet to cubic yards by dividing by 27. Add an allowance only after considering ground preparation, edging, compaction, and how material will be spread.'] },
      { title: 'Confirm the material density', paragraphs: ['Different aggregates do not have one universal weight per cubic yard. Gradation, moisture, and compaction affect density. Ask the supplier for an estimate for the specific product and use it instead of a generic reference value.', 'A calculator’s ton estimate is only as accurate as the density entered. Verify weight limits, delivery conditions, and order increments with the supplier.'] },
    ],
  },
  'paint-calculator-guide': {
    title: 'Paint estimating guide', kicker: 'PAINTING PROJECTS',
    intro: 'Estimate paint from your wall dimensions, the number of coats, and the coverage listed for your chosen product.',
    sections: [
      { title: 'Measure surfaces consistently', paragraphs: ['For rectangular walls, multiply width by height. Subtract the area of large doors and windows when useful; small openings can be left in the total to provide a modest allowance.', 'Add walls individually for a room. Ceilings, trim, cabinets, and textured surfaces need separate measurements and may have different coverage.'] },
      { title: 'Use product-specific coverage', paragraphs: ['Coverage varies by paint formulation, surface texture, porosity, color change, and application method. Read the label and consider primer or additional coats where the manufacturer recommends them.', 'The purchase estimate rounds gallons up to whole gallons. Compare the estimated coverage with available package sizes and confirm your plan with the product instructions.'] },
    ],
  },
  about: {
    title: 'About BuildCalc', kicker: 'PLAN SMARTER',
    intro: 'BuildCalc is a collection of browser-based tools for planning common home improvement and construction material needs.',
    sections: [
      { title: 'Practical project planning', paragraphs: ['Our calculators turn measurements into understandable arithmetic estimates. They are designed to help with early planning—not to replace product instructions, supplier advice, professional judgment, or building requirements.', 'Calculator inputs stay in your browser. The core estimates do not require an account, server, or external API.'] },
      { title: 'Transparent assumptions', paragraphs: ['Coverage, density, waste, and site conditions can vary significantly. Each calculator explains the assumptions it uses so you can adapt inputs and verify important quantities before purchase.'] },
    ],
  },
  contact: {
    title: 'Contact BuildCalc', kicker: 'GET IN TOUCH',
    intro: 'Have a question or suggestion? You can draft a note below, but this demo does not deliver or store messages.',
    sections: [
      { title: 'Message delivery is not configured', paragraphs: ['BuildCalc currently has no message-delivery service. Submitting this form will not send your message or transmit your information; a backend or approved contact integration must be configured before messages can be delivered.'] },
    ],
  },
  privacy: {
    title: 'Privacy policy', kicker: 'YOUR PRIVACY',
    intro: 'This starter policy describes the current BuildCalc demo and must be reviewed before the site is launched publicly.',
    sections: [
      { title: 'Calculator data', paragraphs: ['Calculator inputs are processed in your browser and are not sent to a BuildCalc server by the core calculator functionality. No analytics, tracking, or advertising scripts are enabled by default.', 'If analytics, advertising, cookies, contact processing, or other third-party services are added in production, this policy must be updated to accurately explain those services, the data involved, retention, and available choices.'] },
      { title: 'Policy review', paragraphs: ['This starter is not legal advice and is not a substitute for a policy tailored to the actual production website and its jurisdiction. Review it with appropriate counsel before use.'] },
    ],
  },
  terms: {
    title: 'Terms of use', kicker: 'USING BUILDCALC',
    intro: 'These starter terms describe the intended use of BuildCalc and should be reviewed for the final production service.',
    sections: [
      { title: 'Estimates and responsibility', paragraphs: ['BuildCalc provides general planning estimates based on the measurements and assumptions entered. Results may differ from actual material needs and are not a quote, guarantee, engineering design, or professional advice.', 'Verify measurements, product coverage, material properties, code requirements, and purchase quantities with suppliers and qualified professionals. You are responsible for determining whether an estimate is suitable for your project.'] },
      { title: 'Availability and review', paragraphs: ['The tools are offered as-is and may change. These starter terms are not legal advice; have them reviewed and adapted before the website is used in production.'] },
    ],
  },
  disclaimer: {
    title: 'Disclaimer', kicker: 'IMPORTANT INFORMATION',
    intro: 'BuildCalc calculators provide estimates for general planning only.',
    sections: [
      { title: 'Not professional or structural advice', paragraphs: ['Results depend on user-entered measurements and assumptions. Material density, coverage, site conditions, cutting, waste, and product packaging vary. Verify results with product documentation, suppliers, and qualified professionals.', 'Concrete volume estimates do not establish structural adequacy or construction compliance. Nothing on this site replaces engineering, local codes, safety instructions, or professional advice.'] },
      { title: 'No guaranteed outcome', paragraphs: ['BuildCalc does not guarantee that an estimate will match the quantity required or the price charged. Confirm quantities, delivery terms, and project requirements before making decisions or purchases.'] },
    ],
  },
};

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './content.html',
})
export class ContentPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly pageKey = this.route.snapshot.paramMap.get('slug') ?? this.route.snapshot.data['contentKey'] as string;
  protected readonly page: PageContent = PAGES[this.pageKey] ?? PAGES['disclaimer'];
  protected readonly guides = this.pageKey === 'guides';
  protected readonly contact = this.pageKey === 'contact';
  protected readonly contactNotice = signal(false);
  protected readonly guideCalculators = CALCULATORS.filter((item) =>
    item.slug === 'gravel-calculator' || item.slug === 'paint-calculator');

  protected submitContact(): void {
    this.contactNotice.set(true);
  }
}

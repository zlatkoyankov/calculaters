import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { GUIDES, Guide } from '../data/guides';
import { AdSlotComponent } from '../shared/ad-slot.component';
import { MaterialArtComponent } from '../shared/material-art.component';

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
  imports: [RouterLink, FormsModule, MaterialArtComponent, AdSlotComponent],
  templateUrl: './content.html',
})
export class ContentPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly pageKey = this.route.snapshot.paramMap.get('slug') ?? this.route.snapshot.data['contentKey'] as string;
  protected readonly guides = GUIDES;
  protected readonly isGuideIndex = this.pageKey === 'guides';
  protected readonly guide: Guide | undefined = GUIDES.find((item) => item.slug === this.pageKey);
  protected readonly page: PageContent = this.guide
    ? { title: this.guide.title, kicker: this.guide.kicker, intro: this.guide.intro, sections: this.guide.sections }
    : this.isGuideIndex
      ? { title: 'Material guides', kicker: 'PROJECT KNOW-HOW', intro: 'Understand the assumptions behind common material estimates and learn what to confirm before placing an order.', sections: [] }
      : PAGES[this.pageKey] ?? PAGES['disclaimer'];
  protected readonly bannerImage = `url(images/${this.guide?.kind ?? 'hero'}.webp)`;
  protected readonly contact = this.pageKey === 'contact';
  protected readonly contactNotice = signal(false);

  protected submitContact(): void {
    this.contactNotice.set(true);
  }
}

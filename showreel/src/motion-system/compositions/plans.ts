import { FORMAT_SIZE, type CompositionPlan } from "./plan";

/**
 * Hand-written plans registered as compositions. Each is an example of what an
 * agent would produce; the render path is identical.
 */
export type PlanComposition = { id: string; plan: CompositionPlan; width: number; height: number };

const size = (plan: CompositionPlan) => FORMAT_SIZE[plan.format];

const register = (id: string, plan: CompositionPlan): PlanComposition => ({ id, plan, ...size(plan) });

export const PLAN_COMPOSITIONS: PlanComposition[] = [
  register("Plan-atomic-intro", {
    brand: "atomic",
    intent: "portfolio-intro",
    format: "16:9",
    story: [
      {
        beat: "hook",
        pattern: "panel-mosaic",
        content: {
          media: [
            { src: "media/surreal-facility.mp4", startFrom: 22 },
            { src: "media/surreal-carousel.mp4", startFrom: 28 },
            { src: "media/creo-portfolio.mp4", startFrom: 20 },
          ],
          headline: ["Built to move"],
        },
        dark: true,
      },
      {
        beat: "reveal",
        pattern: "browser-scroll",
        content: { media: [{ src: "media/creo-hero.mp4", startFrom: 8 }], url: "creo-agency.com", label: "Live ↗" },
        transition: "cut",
      },
      {
        beat: "close",
        pattern: "logo-outro",
        content: { headline: ["Geet Parmar"], subhead: "Webflow + creative development", cta: "For design studios" },
        transition: "shutter",
      },
    ],
  }),

  /* ---------------- EdelGive: three pieces, one vocabulary ---------------- */

  register("Plan-edelgive-intro", {
    brand: "edelgive",
    intent: "foundation-intro",
    format: "16:9",
    duration: 9,
    story: [
      {
        beat: "hook",
        pattern: "photo-statement",
        content: {
          media: [{ src: "media/edelgive/land-fields.jpg", position: "50% 60%" }],
          headline: ["How we work", "towards change"],
          subhead: "We operate at the intersection of capital and community.",
          cta: "Learn more",
        },
      },
      {
        beat: "proof",
        pattern: "stat-tiles",
        transition: "wave",
        content: {
          stats: [
            { value: "Rs. 1,429 Crore", caption: "Philanthropic capital influenced" },
            { value: "300+", caption: "Grassroot NGOs supported" },
          ],
          media: [
            { src: "media/edelgive/land-mountain.png", position: "50% 30%" },
            { src: "media/edelgive/land-desert.png" },
          ],
          options: { columns: 4 },
        },
      },
      {
        beat: "close",
        pattern: "logo-outro",
        transition: "fade",
        content: { logo: { src: "media/logos/edelgive.png" }, subhead: "Building smarter giving systems.", cta: "Become a funder", url: "edelgive.org" },
      },
    ],
  }),

  register("Plan-edelgive-showcase", {
    brand: "edelgive",
    intent: "website-showcase",
    format: "16:9",
    duration: 15,
    story: [
      {
        beat: "hook",
        pattern: "headline-reveal",
        content: { label: "Beyond grants", headline: ["Building smarter", "giving systems"], subhead: "The future of giving lies in smarter, more responsive systems." },
      },
      {
        beat: "reveal",
        pattern: "browser-scroll",
        transition: "wave",
        content: { media: [{ src: "media/gallery/grow.jpg" }], url: "edelgive.org" },
      },
      {
        beat: "detail",
        pattern: "pillar-index",
        transition: "fade",
        content: {
          headline: ["Our work spans three interconnected pillars"],
          body: [
            "For Funders | We simplify the complexity of giving in India. | From deal-by-deal grants to long-term commitments, we help funders deploy capital strategically.",
            "For NGOs | Holistic support, not just funding. | Capacity building, organisation development and measurement for grassroots partners.",
            "Flagship Programs | Collaboratives across gender, education, livelihoods and climate. | Eight active collaboratives influencing systemic change across 167 districts.",
          ].join("\n"),
        },
      },
      {
        beat: "proof",
        pattern: "split-reveal",
        transition: "wave",
        content: { label: "Our legacy", headline: ["Born in 2008 from", "Edelweiss Group's", "founding vision."], subhead: "One of India's most respected platforms for strategic giving.", media: [{ src: "media/edelgive/land-fields.jpg", position: "50% 20%" }] },
      },
      {
        beat: "close",
        pattern: "logo-outro",
        transition: "fade",
        content: { logo: { src: "media/logos/edelgive.png" }, subhead: "Looking to give with purpose?", cta: "Partner with us", url: "edelgive.org" },
      },
    ],
  }),

  register("Plan-edelgive-reel", {
    brand: "edelgive",
    intent: "brand-reel",
    format: "16:9",
    duration: 25,
    story: [
      {
        beat: "hook",
        pattern: "photo-statement",
        content: { media: [{ src: "media/edelgive/land-mountain.png" }], label: "EdelGive Foundation", headline: ["Giving, designed", "for lasting change"], options: { cta: false } },
      },
      {
        beat: "statement",
        pattern: "headline-reveal",
        transition: "wave",
        content: { headline: ["Capital meets", "community"], subhead: "We design pathways for funders and grassroots organisations to engage meaningfully." },
      },
      {
        beat: "proof",
        pattern: "stat-tiles",
        transition: "fade",
        content: {
          stats: [
            { value: "Rs. 1,429 Crore", caption: "Philanthropic capital influenced" },
            { value: "300+", caption: "Grassroot NGOs supported" },
            { value: "8+", caption: "Active collaboratives" },
            { value: "167 Districts", caption: "Systemic change across India" },
          ],
          media: [
            { src: "media/edelgive/land-mountain.png", position: "50% 30%" },
            { src: "media/edelgive/land-desert.png" },
            { src: "media/edelgive/land-fields.jpg", position: "50% 20%" },
            { src: "media/edelgive/land-mountain.png" },
          ],
        },
      },
      {
        beat: "section-intro",
        pattern: "photo-statement",
        transition: "wave",
        content: { media: [{ src: "media/edelgive/land-desert.png" }], headline: ["Our legacy"], subhead: "Born in 2008 from Edelweiss Group's founding vision, EdelGive began with small grants to young NGOs across India.", options: { cta: false, scrim: 0.5 } },
      },
      {
        beat: "detail",
        pattern: "pillar-index",
        transition: "wave",
        content: {
          body: [
            "For Funders | We simplify the complexity of giving in India. | From deal-by-deal grants to long-term commitments.",
            "For NGOs | Holistic support, not just funding. | Capacity building, organisation development and measurement.",
            "Flagship Programs | Collaboratives that move systems. | Gender, education, livelihoods and climate.",
          ].join("\n"),
        },
      },
      {
        beat: "proof",
        pattern: "logo-wall",
        transition: "fade",
        content: {
          logos: [
            { src: "media/logos/edelgive.png" },
            { src: "media/logos/growplus.png" },
            { src: "media/logos/edelgive.png" },
            { src: "media/logos/growplus.png" },
            { src: "media/logos/edelgive.png" },
          ],
        },
      },
      {
        beat: "close",
        pattern: "photo-statement",
        transition: "wave",
        content: { media: [{ src: "media/edelgive/land-fields.jpg", position: "50% 60%" }], headline: ["Looking to give", "with purpose?"], cta: "Become a funder", options: { scrim: 0.45 } },
      },
    ],
  }),
];

// ============================================================================
// Deal Scoring Engine
// ============================================================================
// This module simulates what an LLM-backed analysis service would return.
// It is intentionally isolated behind `analyzeListing()` / `generateAIReport()`
// so that swapping in a real OpenAI call later means changing the *inside*
// of these two functions only — every caller (API routes, components) is
// already written against the final shape (DealAnalysis / AIReport).
//
// To wire up real AI later:
//   1. Implement `callOpenAIForAnalysis(listing)` in src/lib/ai/openai.ts
//   2. Swap the body of `analyzeListing` to call it (keep the fallback!)
// ============================================================================

import type {
  Listing,
  DealAnalysis,
  AIReport,
  ConfidenceRating,
  DemandRating,
  RiskRating,
} from "@/types";

/** Simple seeded PRNG so mock data is stable across renders/requests for a given listing id. */
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const CONDITION_MULTIPLIER: Record<Listing["condition"], number> = {
  new: 1.15,
  like_new: 1.08,
  excellent: 1.0,
  good: 0.9,
  fair: 0.75,
  poor: 0.55,
};

const VAGUE_DESCRIPTION_MARKERS = [
  "must go",
  "as is",
  "no lowballers",
  "asking",
  "obo",
  "quick sale",
  "moving",
];

function daysAgo(iso: string): number {
  return Math.max(0, (Date.now() - new Date(iso).getTime()) / 86_400_000);
}

/**
 * Core valuation model. Derives a plausible market value from listing price,
 * condition, category baseline, and a per-listing random walk — deterministic
 * per listing id so scores don't jitter between page loads.
 */
export function analyzeListing(listing: Listing): DealAnalysis {
  const rand = seededRandom(listing.id);

  const conditionMult = CONDITION_MULTIPLIER[listing.condition];
  const hasVagueDescription = VAGUE_DESCRIPTION_MARKERS.some((m) =>
    listing.description.toLowerCase().includes(m)
  );
  const descriptionIsShort = listing.description.trim().length < 60;

  const basePremium = 0.1 + rand() * 0.6;
  const conditionAdjustedPremium = basePremium * conditionMult;

  const estimatedMarketValue = Math.round(
    listing.price * (1 + conditionAdjustedPremium)
  );

  const estimatedProfit = Math.max(0, estimatedMarketValue - listing.price);
  const roiPercent = listing.price > 0
    ? Math.round((estimatedProfit / listing.price) * 100)
    : 0;

  const recencyBonus = daysAgo(listing.listedAt) < 1 ? 8 : daysAgo(listing.listedAt) < 3 ? 4 : 0;
  const vaguenessBonus = hasVagueDescription || descriptionIsShort ? 6 : 0;
  const conditionBonus = (conditionMult - 0.55) * 20;

  let dealScore = Math.round(
    Math.min(roiPercent, 90) * 0.75 + recencyBonus + vaguenessBonus + conditionBonus
  );
  dealScore = Math.max(5, Math.min(99, dealScore));

  const confidence: ConfidenceRating =
    dealScore > 80 && (hasVagueDescription || descriptionIsShort)
      ? "high"
      : dealScore > 55
      ? "medium"
      : "low";

  const demandRating: DemandRating =
    listing.category === "electronics" || listing.category === "gaming"
      ? rand() > 0.3 ? "very_high" : "high"
      : listing.category === "watches" || listing.category === "collectibles"
      ? "high"
      : rand() > 0.5 ? "medium" : "high";

  const riskRating: RiskRating =
    listing.condition === "poor" || listing.condition === "fair"
      ? "high"
      : dealScore < 40
      ? "medium"
      : "low";

  const estimatedSellTimeDays = Math.round(
    demandRating === "very_high" ? 2 + rand() * 3
    : demandRating === "high" ? 4 + rand() * 5
    : demandRating === "medium" ? 7 + rand() * 7
    : 12 + rand() * 10
  );

  const reasons = buildReasons({
    listing,
    estimatedMarketValue,
    hasVagueDescription,
    descriptionIsShort,
    conditionMult,
    listedRecently: daysAgo(listing.listedAt) < 2,
  });

  return {
    listingId: listing.id,
    dealScore,
    estimatedMarketValue,
    estimatedProfit,
    roiPercent,
    confidence,
    reasons,
    demandRating,
    riskRating,
    estimatedSellTimeDays,
    generatedAt: new Date().toISOString(),
  };
}

function buildReasons(args: {
  listing: Listing;
  estimatedMarketValue: number;
  hasVagueDescription: boolean;
  descriptionIsShort: boolean;
  conditionMult: number;
  listedRecently: boolean;
}): string[] {
  const { listing, estimatedMarketValue, hasVagueDescription, descriptionIsShort, conditionMult, listedRecently } = args;
  const reasons: string[] = [];

  reasons.push(
    `Similar listings in this category typically sell for around $${estimatedMarketValue.toLocaleString()}.`
  );

  if (listedRecently) {
    reasons.push("Recently listed — less competition and a motivated seller.");
  }

  if (hasVagueDescription) {
    reasons.push("Seller description suggests urgency, which often means room to negotiate.");
  } else if (descriptionIsShort) {
    reasons.push("Seller description is minimal, suggesting they may not know the item's full value.");
  }

  if (conditionMult >= 1.0) {
    reasons.push(`Condition is rated "${listing.condition.replace("_", " ")}", supporting a higher resale price.`);
  } else if (conditionMult < 0.8) {
    reasons.push(`Condition is rated "${listing.condition.replace("_", " ")}" — factor in refurbishment time.`);
  }

  if (listing.photos.length <= 1) {
    reasons.push("Listing has limited photos, which may be suppressing buyer interest and price.");
  }

  return reasons.slice(0, 5);
}

/**
 * Generates the deep-dive report for the listing detail page.
 * Deterministic per listing, built from the same analysis primitives.
 */
export function generateAIReport(listing: Listing, analysis: DealAnalysis): AIReport {
  const rand = seededRandom(listing.id + "-report");

  const worthBuying = analysis.dealScore >= 60;
  const low = Math.round(analysis.estimatedMarketValue * 0.88);
  const high = Math.round(analysis.estimatedMarketValue * 1.12);

  const platformPool = [
    { platform: "Facebook Marketplace", reason: "Largest local buyer pool, no shipping needed for bulky items." },
    { platform: "eBay", reason: "Best for reaching collectors and out-of-area buyers willing to pay a premium." },
    { platform: "OfferUp", reason: "Fast local turnaround for mid-value electronics and furniture." },
    { platform: "Craigslist", reason: "Good for large or heavy items where local pickup is preferred." },
    { platform: "Mercari", reason: "Lower fees than eBay for small, shippable items." },
    { platform: "Chrono24", reason: "Specialist marketplace with buyers who pay full value for watches." },
  ];

  const bestResalePlatforms =
    listing.category === "watches"
      ? [platformPool[5], platformPool[1], platformPool[0]]
      : listing.category === "furniture" || listing.category === "vehicles"
      ? [platformPool[0], platformPool[3]]
      : [platformPool[0], platformPool[1], platformPool[2]];

  const risks: string[] = [];
  if (listing.condition === "fair" || listing.condition === "poor") {
    risks.push("Item condition may require repair or cleaning before resale, cutting into margin.");
  }
  if (analysis.confidence === "low") {
    risks.push("Limited comparable data — actual resale value could vary more than usual.");
  }
  if (listing.photos.length <= 1) {
    risks.push("Few photos available; inspect in person before buying to confirm condition claims.");
  }
  risks.push("Resale price assumes a private-party sale; platform fees will reduce net profit.");
  if (analysis.demandRating === "low" || analysis.demandRating === "medium") {
    risks.push("Moderate demand may extend time to sell beyond the estimate.");
  }

  const negotiationSuggestions = [
    `Open at $${Math.round(listing.price * 0.85).toLocaleString()} and anchor below asking.`,
    "Ask if the price is firm — vague listings often have room to move.",
    "Bundle in a cash, same-day pickup offer; sellers often accept less for convenience.",
    "Point out any condition flaws visible in photos as a reason for a lower offer.",
  ];

  const suggestedMaxOffer = Math.round(
    listing.price + analysis.estimatedProfit * 0.15
  );

  const soldTitles = generateComparableTitles(listing);
  const similarSoldItems = soldTitles.map((title, i) => {
    const variance = 0.85 + rand() * 0.3;
    const soldPrice = Math.round(analysis.estimatedMarketValue * variance);
    const daysBack = Math.round(3 + rand() * 40);
    const soldDate = new Date(Date.now() - daysBack * 86_400_000).toISOString();
    return {
      title,
      soldPrice,
      soldDate,
      platform: i % 2 === 0 ? "eBay" : "Facebook Marketplace",
    };
  });

  const verdictSummary = worthBuying
    ? `This listing scores ${analysis.dealScore}/100 — the asking price is well below typical resale value for comparable items in ${listing.condition.replace("_", " ")} condition. With an estimated $${analysis.estimatedProfit.toLocaleString()} profit and ${analysis.estimatedSellTimeDays}-day estimated sell time, this is a strong flip candidate.`
    : `This listing scores ${analysis.dealScore}/100 — the margin is thinner than average once fees and time are factored in. It may still be worthwhile at a lower negotiated price.`;

  return {
    listingId: listing.id,
    worthBuying,
    verdictSummary,
    commonResalePriceRange: { low, high },
    bestResalePlatforms,
    estimatedSellingTimeDays: analysis.estimatedSellTimeDays,
    risks: risks.slice(0, 5),
    negotiationSuggestions,
    suggestedMaxOffer,
    similarSoldItems,
  };
}

function generateComparableTitles(listing: Listing): string[] {
  const base = listing.title.split(" ").slice(0, 3).join(" ");
  return [
    `${base} — sold locally`,
    `${base} (similar condition)`,
    `${base} bundle`,
  ];
}

// ============================================================================
// MarketFlip AI — Core Domain Types
// ============================================================================
// These types define the shape of data as it flows through the app:
// raw marketplace listing -> AI analysis -> UI presentation.
// Keeping them centralized means the mock data layer and a future real
// ingestion/AI layer can both target the exact same contracts.
// ============================================================================

export type ListingCondition =
  | "new"
  | "like_new"
  | "excellent"
  | "good"
  | "fair"
  | "poor";

export type ListingSource = "facebook_marketplace" | "craigslist" | "ebay" | "offerup";

export type Category =
  | "electronics"
  | "gaming"
  | "furniture"
  | "bikes"
  | "watches"
  | "tools"
  | "appliances"
  | "sporting_goods"
  | "collectibles"
  | "vehicles";

export type DemandRating = "low" | "medium" | "high" | "very_high";
export type RiskRating = "low" | "medium" | "high";
export type ConfidenceRating = "low" | "medium" | "high";

/** Raw listing as it would come from a marketplace source. */
export interface Listing {
  id: string;
  source: ListingSource;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: {
    city: string;
    state: string;
    distanceMiles?: number;
  };
  photos: string[];
  condition: ListingCondition;
  category: Category;
  listedAt: string; // ISO timestamp
  sellerName?: string;
  url?: string;
}

/** AI-generated valuation & scoring for a listing. Computed, not stored raw. */
export interface DealAnalysis {
  listingId: string;
  dealScore: number; // 0-100
  estimatedMarketValue: number;
  estimatedProfit: number;
  roiPercent: number;
  confidence: ConfidenceRating;
  reasons: string[];
  demandRating: DemandRating;
  riskRating: RiskRating;
  estimatedSellTimeDays: number;
  generatedAt: string;
}

/** A listing joined with its AI analysis — the primary unit rendered in UI. */
export interface ScoredListing extends Listing {
  analysis: DealAnalysis;
}

/** Deep-dive AI report shown on the listing detail page. */
export interface AIReport {
  listingId: string;
  worthBuying: boolean;
  verdictSummary: string;
  commonResalePriceRange: { low: number; high: number };
  bestResalePlatforms: { platform: string; reason: string }[];
  estimatedSellingTimeDays: number;
  risks: string[];
  negotiationSuggestions: string[];
  suggestedMaxOffer: number;
  similarSoldItems: {
    title: string;
    soldPrice: number;
    soldDate: string;
    platform: string;
  }[];
}

export type SortOption =
  | "highest_profit"
  | "highest_roi"
  | "newest"
  | "easiest_resale"
  | "deal_score";

export interface ResellerFilters {
  sortBy: SortOption;
  minProfit?: number;
  maxBuyPrice?: number;
  category?: Category;
}

/** User-facing saved/favorited/viewed relationship to a listing. */
export type UserListingRelation = "saved" | "favorited" | "viewed" | "watchlist";

export interface UserListingRecord {
  id: string;
  userId: string;
  listingId: string;
  relation: UserListingRelation;
  createdAt: string;
}

export interface UserProfileStats {
  totalMoneySaved: number;
  totalEstimatedProfitFound: number;
  dealsViewed: number;
  favoriteCategories: { category: Category; count: number }[];
}

export type TrendingDeal = ScoredListing;

export const CATEGORY_LABELS: Record<Category, string> = {
  electronics: "Electronics",
  gaming: "Gaming",
  furniture: "Furniture",
  bikes: "Bikes",
  watches: "Watches",
  tools: "Tools",
  appliances: "Appliances",
  sporting_goods: "Sporting Goods",
  collectibles: "Collectibles",
  vehicles: "Vehicles",
};

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  new: "New",
  like_new: "Like New",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

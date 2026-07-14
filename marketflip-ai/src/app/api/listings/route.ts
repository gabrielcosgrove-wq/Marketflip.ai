import { NextRequest, NextResponse } from "next/server";
import { MOCK_LISTINGS } from "@/lib/data/mock-listings";
import { analyzeListing } from "@/lib/ai/scoring-engine";
import type { ScoredListing, SortOption, Category } from "@/types";

function sortListings(listings: ScoredListing[], sortBy: SortOption): ScoredListing[] {
  const copy = [...listings];
  switch (sortBy) {
    case "highest_profit":
      return copy.sort((a, b) => b.analysis.estimatedProfit - a.analysis.estimatedProfit);
    case "highest_roi":
      return copy.sort((a, b) => b.analysis.roiPercent - a.analysis.roiPercent);
    case "newest":
      return copy.sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime());
    case "easiest_resale":
      return copy.sort((a, b) => a.analysis.estimatedSellTimeDays - b.analysis.estimatedSellTimeDays);
    case "deal_score":
    default:
      return copy.sort((a, b) => b.analysis.dealScore - a.analysis.dealScore);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sortBy = (searchParams.get("sortBy") as SortOption) ?? "deal_score";
  const minProfit = searchParams.get("minProfit");
  const maxBuyPrice = searchParams.get("maxBuyPrice");
  const category = searchParams.get("category") as Category | null;

  let scored: ScoredListing[] = MOCK_LISTINGS.map((listing) => ({
    ...listing,
    analysis: analyzeListing(listing),
  }));

  if (category) {
    scored = scored.filter((l) => l.category === category);
  }
  if (minProfit) {
    scored = scored.filter((l) => l.analysis.estimatedProfit >= Number(minProfit));
  }
  if (maxBuyPrice) {
    scored = scored.filter((l) => l.price <= Number(maxBuyPrice));
  }

  scored = sortListings(scored, sortBy);

  return NextResponse.json({ results: scored, count: scored.length });
}

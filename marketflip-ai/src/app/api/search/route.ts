import { NextRequest, NextResponse } from "next/server";
import { MOCK_LISTINGS } from "@/lib/data/mock-listings";
import { analyzeListing } from "@/lib/ai/scoring-engine";
import type { ScoredListing } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const category = searchParams.get("category");

  let results = MOCK_LISTINGS;

  if (q) {
    results = results.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
    );
  }

  if (category) {
    results = results.filter((l) => l.category === category);
  }

  const scored: ScoredListing[] = results
    .map((listing) => ({ ...listing, analysis: analyzeListing(listing) }))
    .sort((a, b) => b.analysis.dealScore - a.analysis.dealScore);

  return NextResponse.json({ results: scored, count: scored.length });
}

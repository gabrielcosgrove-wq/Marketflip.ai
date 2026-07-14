import Link from "next/link";
import { MOCK_LISTINGS } from "@/lib/data/mock-listings";
import { analyzeListing } from "@/lib/ai/scoring-engine";
import { ListingCard } from "@/components/listings/listing-card";
import { ArrowRight } from "lucide-react";
import type { ScoredListing } from "@/types";

export function TrendingDeals() {
  const scored: ScoredListing[] = MOCK_LISTINGS.map((listing) => ({
    ...listing,
    analysis: analyzeListing(listing),
  }))
    .sort((a, b) => b.analysis.dealScore - a.analysis.dealScore)
    .slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-wider text-profit font-medium mb-2">
            Live right now
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Trending deals
          </h2>
        </div>
        <Link
          href="/search"
          className="hidden sm:flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {scored.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}

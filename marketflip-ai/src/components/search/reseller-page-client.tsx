"use client";

import { useEffect, useState, useCallback } from "react";
import { ResellerCard } from "@/components/listings/reseller-card";
import { ResellerFiltersBar } from "@/components/search/reseller-filters-bar";
import type { ScoredListing, SortOption } from "@/types";

function ResellerListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-32 rounded-[var(--radius-md)] border border-border bg-surface p-4">
          <div className="flex gap-4 h-full">
            <div className="h-24 w-24 rounded-[var(--radius-sm)] skeleton shrink-0" />
            <div className="flex-1 flex flex-col gap-2 justify-center">
              <div className="h-4 w-3/5 rounded skeleton" />
              <div className="h-3 w-2/5 rounded skeleton" />
              <div className="h-10 w-full rounded skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ResellerPageClient() {
  const [sortBy, setSortBy] = useState<SortOption>("deal_score");
  const [minProfit, setMinProfit] = useState("");
  const [maxBuyPrice, setMaxBuyPrice] = useState("");
  const [results, setResults] = useState<ScoredListing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sortBy });
    if (minProfit) params.set("minProfit", minProfit);
    if (maxBuyPrice) params.set("maxBuyPrice", maxBuyPrice);
    try {
      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }, [sortBy, minProfit, maxBuyPrice]);

  useEffect(() => {
    const t = setTimeout(fetchListings, 200); // debounce filter typing
    return () => clearTimeout(t);
  }, [fetchListings]);

  const totalProfit = results.reduce((sum, l) => sum + l.analysis.estimatedProfit, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
          Reseller tools
        </h1>
        <p className="text-muted">
          Built for flipping — sort by margin, filter by budget, and see demand
          and risk at a glance.
        </p>
      </div>

      {!loading && results.length > 0 && (
        <div className="mb-6 rounded-[var(--radius-md)] border border-accent-2/20 bg-accent-2-soft px-5 py-3 flex items-center justify-between">
          <span className="text-sm text-accent-2">
            {results.length} listings match your filters
          </span>
          <span className="text-sm font-display font-semibold text-accent-2 tabular-nums">
            ${totalProfit.toLocaleString()} total potential profit
          </span>
        </div>
      )}

      <div className="mb-8">
        <ResellerFiltersBar
          sortBy={sortBy}
          onSortChange={setSortBy}
          minProfit={minProfit}
          onMinProfitChange={setMinProfit}
          maxBuyPrice={maxBuyPrice}
          onMaxBuyPriceChange={setMaxBuyPrice}
        />
      </div>

      {loading ? (
        <ResellerListSkeleton />
      ) : results.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-border bg-surface py-20 text-center">
          <p className="text-muted">No listings match these filters.</p>
          <p className="text-sm text-muted-2 mt-1">Try raising your max buy price or lowering min profit.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((listing) => (
            <ResellerCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

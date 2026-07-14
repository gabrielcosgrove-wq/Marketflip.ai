"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingGridSkeleton } from "@/components/listings/listing-skeleton";
import { CategoryFilterBar } from "@/components/search/category-filter-bar";
import type { Category, ScoredListing } from "@/types";

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = (searchParams.get("category") as Category | null) ?? null;

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<Category | null>(initialCategory);
  const [results, setResults] = useState<ScoredListing[]>([]);
  const [loading, setLoading] = useState(true);

  const runSearch = useCallback(async (q: string, cat: Category | null) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("category", cat);
    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch(initialQuery, initialCategory);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    router.push(`/search?${params.toString()}`);
    runSearch(query, category);
  }

  function handleCategorySelect(c: Category | null) {
    setCategory(c);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (c) params.set("category", c);
    router.push(`/search?${params.toString()}`);
    runSearch(query, c);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
          Search listings
        </h1>
        <p className="text-muted">
          AI-scored results across every category — highest deal score first.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative mb-6 max-w-xl">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Gaming PC, iPhone, Rolex, Couch..."
          className="w-full rounded-full border border-border bg-surface pl-11 pr-4 py-3 text-sm placeholder:text-muted-2 focus:border-accent/50 outline-none transition-colors"
        />
      </form>

      <div className="flex items-center gap-2 mb-8">
        <SlidersHorizontal size={14} className="text-muted-2 shrink-0" />
        <CategoryFilterBar selected={category} onSelect={handleCategorySelect} />
      </div>

      {loading ? (
        <ListingGridSkeleton count={6} />
      ) : results.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-border bg-surface py-20 text-center">
          <p className="text-muted">No listings match that search yet.</p>
          <p className="text-sm text-muted-2 mt-1">Try a broader term or clear filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-2 mb-4">{results.length} results</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

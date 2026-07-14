"use client";

import { useEffect, useState } from "react";
import { useDashboardStore } from "@/store/dashboard-store";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingGridSkeleton } from "@/components/listings/listing-skeleton";
import { Bookmark, Heart, Eye, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils/format";
import type { ScoredListing, UserListingRelation } from "@/types";

const TABS: { key: UserListingRelation; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { key: "saved", label: "Saved deals", icon: Bookmark },
  { key: "favorited", label: "Favorites", icon: Heart },
  { key: "watchlist", label: "Watchlist", icon: Eye },
  { key: "viewed", label: "Recently viewed", icon: ListChecks },
];

export function DashboardClient() {
  const { records } = useDashboardStore();
  const [tab, setTab] = useState<UserListingRelation>("saved");
  const [allListings, setAllListings] = useState<ScoredListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => setAllListings(data.results ?? []))
      .finally(() => setLoading(false));
  }, []);

  const idsForTab = records[tab] ?? [];
  const listingsForTab = idsForTab
    .map((id) => allListings.find((l) => l.id === id))
    .filter((l): l is ScoredListing => Boolean(l));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
          Dashboard
        </h1>
        <p className="text-muted">Everything you&apos;ve saved, favorited, and tracked in one place.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              tab === key
                ? "border-accent/40 bg-accent-soft text-accent"
                : "border-border text-muted hover:text-foreground hover:border-border-strong"
            )}
          >
            <Icon size={15} />
            {label}
            <span className="text-xs text-muted-2">({(records[key] ?? []).length})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <ListingGridSkeleton count={3} />
      ) : listingsForTab.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-border bg-surface py-20 text-center">
          <p className="text-muted">Nothing here yet.</p>
          <p className="text-sm text-muted-2 mt-1">
            Browse the <a href="/search" className="text-accent hover:underline">search page</a> and save a few deals to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listingsForTab.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

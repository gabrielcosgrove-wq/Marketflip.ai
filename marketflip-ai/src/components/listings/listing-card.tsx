"use client";

import Image from "next/image";
import Link from "next/link";
import type { ScoredListing } from "@/types";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DealScoreGauge } from "@/components/charts/deal-score-gauge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils/format";
import { MapPin, Heart, Bookmark, TrendingUp } from "lucide-react";
import { useDashboardStore } from "@/store/dashboard-store";
import { cn } from "@/lib/utils/format";

export function ListingCard({ listing }: { listing: ScoredListing }) {
  const { toggleRecord, hasRecord } = useDashboardStore();
  const isSaved = hasRecord(listing.id, "saved");
  const isFavorited = hasRecord(listing.id, "favorited");

  return (
    <Card className="group relative overflow-hidden card-hover flex flex-col">
      <Link href={`/listing/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
          <Image
            src={listing.photos[0]}
            alt={listing.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge tone="neutral" className="glass">
              {CATEGORY_LABELS[listing.category]}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <div className="glass rounded-full p-0.5">
              <DealScoreGauge score={listing.analysis.dealScore} size={56} strokeWidth={5} />
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <Link href={`/listing/${listing.id}`}>
            <h3 className="font-medium leading-snug line-clamp-2 hover:text-accent transition-colors">
              {listing.title}
            </h3>
          </Link>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-2">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {listing.location.city}, {listing.location.state}
            </span>
            <span>{formatRelativeTime(listing.listedAt)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-[var(--radius-sm)] bg-surface-2 p-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-2">Price</p>
            <p className="font-display font-semibold tabular-nums">{formatCurrency(listing.price)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-2">Est. Value</p>
            <p className="font-display font-semibold tabular-nums">
              {formatCurrency(listing.analysis.estimatedMarketValue)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-2">Profit</p>
            <p className="font-display font-semibold tabular-nums text-profit">
              +{formatCurrency(listing.analysis.estimatedProfit)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge tone="profit" icon={<TrendingUp size={12} />}>
            {listing.analysis.roiPercent}% ROI
          </Badge>
          <Badge tone="neutral">{CONDITION_LABELS[listing.condition]}</Badge>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <button
            onClick={() => toggleRecord(listing.id, "saved")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-medium transition-colors",
              isSaved
                ? "border-accent/30 bg-accent-soft text-accent"
                : "border-border text-muted hover:text-foreground hover:border-border-strong"
            )}
          >
            <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
            {isSaved ? "Saved" : "Save"}
          </button>
          <button
            onClick={() => toggleRecord(listing.id, "favorited")}
            aria-label="Favorite"
            className={cn(
              "flex items-center justify-center rounded-full border h-8 w-8 transition-colors",
              isFavorited
                ? "border-danger/30 bg-danger-soft text-danger"
                : "border-border text-muted hover:text-foreground hover:border-border-strong"
            )}
          >
            <Heart size={14} fill={isFavorited ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </Card>
  );
}

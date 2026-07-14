"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  ArrowLeft,
  Heart,
  Bookmark,
  Eye,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Handshake,
  Store,
  History,
  Flame,
} from "lucide-react";
import type { ScoredListing, AIReport } from "@/types";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DealScoreGauge } from "@/components/charts/deal-score-gauge";
import { formatCurrency, formatRelativeTime, formatCompactDate } from "@/lib/utils/format";
import { useDashboardStore } from "@/store/dashboard-store";
import { cn } from "@/lib/utils/format";

const RISK_TONE = { low: "profit", medium: "risk", high: "danger" } as const;
const DEMAND_TONE = { low: "neutral", medium: "neutral", high: "profit", very_high: "profit" } as const;

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
      <div className="aspect-[4/3] rounded-[var(--radius-lg)] skeleton" />
      <div className="flex flex-col gap-4">
        <div className="h-8 w-4/5 rounded skeleton" />
        <div className="h-24 w-full rounded-[var(--radius-md)] skeleton" />
        <div className="h-40 w-full rounded-[var(--radius-md)] skeleton" />
      </div>
    </div>
  );
}

export function ListingDetailClient({ id }: { id: string }) {
  const [listing, setListing] = useState<ScoredListing | null>(null);
  const [report, setReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const { toggleRecord, hasRecord, markViewed } = useDashboardStore();

  useEffect(() => {
    let active = true;
    fetch(`/api/analyze/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setListing(data.listing ?? null);
        setReport(data.report ?? null);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (listing) markViewed(listing.id);
  }, [listing, markViewed]);

  if (loading) return <DetailSkeleton />;

  if (!listing || !report) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-lg font-medium mb-2">Listing not found</p>
        <p className="text-muted mb-6">It may have been sold or removed.</p>
        <Link href="/search" className="text-accent hover:underline">
          Back to search
        </Link>
      </div>
    );
  }

  const { analysis } = listing;
  const isSaved = hasRecord(listing.id, "saved");
  const isFavorited = hasRecord(listing.id, "favorited");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/search"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to search
      </Link>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8">
        {/* LEFT: Photos + description */}
        <div>
          <div className="relative aspect-[4/3] rounded-[var(--radius-lg)] overflow-hidden bg-surface-2 border border-border">
            <Image
              src={listing.photos[activePhoto]}
              alt={listing.title}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            <div className="absolute top-4 left-4">
              <Badge tone="neutral" className="glass">{CATEGORY_LABELS[listing.category]}</Badge>
            </div>
          </div>
          {listing.photos.length > 1 && (
            <div className="mt-3 flex gap-2">
              {listing.photos.map((photo, i) => (
                <button
                  key={photo}
                  onClick={() => setActivePhoto(i)}
                  className={cn(
                    "relative h-16 w-20 rounded-[var(--radius-sm)] overflow-hidden border-2 shrink-0",
                    activePhoto === i ? "border-accent" : "border-transparent opacity-70"
                  )}
                >
                  <Image src={photo} alt="" fill unoptimized className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}

          <Card className="mt-6 p-6">
            <h2 className="font-medium mb-3">Seller&apos;s description</h2>
            <p className="text-sm text-muted leading-relaxed">{listing.description}</p>
          </Card>

          {/* AI Report */}
          <Card className="mt-6 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-2-soft text-accent-2">
                {report.worthBuying ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              </span>
              <h2 className="font-medium">
                {report.worthBuying ? "Worth buying" : "Marginal — negotiate first"}
              </h2>
            </div>
            <p className="text-sm text-muted leading-relaxed mb-6">{report.verdictSummary}</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-[var(--radius-sm)] bg-surface-2 p-4">
                <p className="text-xs text-muted-2 mb-1">Common resale price range</p>
                <p className="font-display font-semibold tabular-nums">
                  {formatCurrency(report.commonResalePriceRange.low)} – {formatCurrency(report.commonResalePriceRange.high)}
                </p>
              </div>
              <div className="rounded-[var(--radius-sm)] bg-surface-2 p-4">
                <p className="text-xs text-muted-2 mb-1">Suggested max offer</p>
                <p className="font-display font-semibold tabular-nums text-accent">
                  {formatCurrency(report.suggestedMaxOffer)}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
                <Store size={15} /> Best resale platforms
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {report.bestResalePlatforms.map((p) => (
                  <div key={p.platform} className="rounded-[var(--radius-sm)] border border-border p-3">
                    <p className="text-sm font-medium mb-0.5">{p.platform}</p>
                    <p className="text-xs text-muted">{p.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
                <ShieldAlert size={15} /> Risks to consider
              </h3>
              <ul className="space-y-2">
                {report.risks.map((r) => (
                  <li key={r} className="text-sm text-muted flex gap-2">
                    <span className="text-risk mt-1">•</span> {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
                <Handshake size={15} /> Negotiation suggestions
              </h3>
              <ul className="space-y-2">
                {report.negotiationSuggestions.map((s) => (
                  <li key={s} className="text-sm text-muted flex gap-2">
                    <span className="text-accent mt-1">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
                <History size={15} /> Similar sold items
              </h3>
              <div className="flex flex-col gap-2">
                {report.similarSoldItems.map((item) => (
                  <div
                    key={item.title + item.soldDate}
                    className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border px-4 py-2.5"
                  >
                    <div>
                      <p className="text-sm">{item.title}</p>
                      <p className="text-xs text-muted-2">
                        {item.platform} · Sold {formatCompactDate(item.soldDate)}
                      </p>
                    </div>
                    <p className="font-display font-semibold tabular-nums text-sm">
                      {formatCurrency(item.soldPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT: Sticky summary panel */}
        <div className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-4">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="font-display text-xl font-semibold leading-snug">{listing.title}</h1>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-2">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {listing.location.city}, {listing.location.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {formatRelativeTime(listing.listedAt)}
                  </span>
                </div>
              </div>
              <DealScoreGauge score={analysis.dealScore} size={72} strokeWidth={6} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatBox label="Asking price" value={formatCurrency(listing.price)} />
              <StatBox label="Est. market value" value={formatCurrency(analysis.estimatedMarketValue)} accent />
              <StatBox label="Est. profit" value={`+${formatCurrency(analysis.estimatedProfit)}`} profit />
              <StatBox label="ROI" value={`${analysis.roiPercent}%`} profit />
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <Badge tone="neutral">{CONDITION_LABELS[listing.condition]}</Badge>
              <Badge tone={DEMAND_TONE[analysis.demandRating]} icon={<Flame size={11} />}>
                {analysis.demandRating.replace("_", " ")} demand
              </Badge>
              <Badge tone={RISK_TONE[analysis.riskRating]}>{analysis.riskRating} risk</Badge>
              <Badge tone="violet">{analysis.confidence} confidence</Badge>
            </div>

            <div className="flex gap-2">
              <Button
                variant={isSaved ? "primary" : "secondary"}
                className="flex-1"
                onClick={() => toggleRecord(listing.id, "saved")}
              >
                <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Saved" : "Save deal"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => toggleRecord(listing.id, "favorited")}
                aria-label="Favorite"
              >
                <Heart size={15} fill={isFavorited ? "currentColor" : "none"} className={isFavorited ? "text-danger" : ""} />
              </Button>
              <Button
                variant="secondary"
                onClick={() => toggleRecord(listing.id, "watchlist")}
                aria-label="Watchlist"
              >
                <Eye size={15} className={hasRecord(listing.id, "watchlist") ? "text-accent-2" : ""} />
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium mb-3">Why this is undervalued</h3>
            <ul className="space-y-2.5">
              {analysis.reasons.map((r) => (
                <li key={r} className="text-sm text-muted flex gap-2">
                  <span className="text-profit mt-0.5">✓</span> {r}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
  profit,
}: {
  label: string;
  value: string;
  accent?: boolean;
  profit?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-surface-2 p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-2 mb-0.5">{label}</p>
      <p
        className={cn(
          "font-display font-semibold tabular-nums",
          profit && "text-profit",
          accent && "text-accent"
        )}
      >
        {value}
      </p>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { ScoredListing } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import { Clock, Flame, ShieldAlert } from "lucide-react";

const DEMAND_TONE = {
  low: "neutral",
  medium: "neutral",
  high: "profit",
  very_high: "profit",
} as const;

const RISK_TONE = {
  low: "profit",
  medium: "risk",
  high: "danger",
} as const;

export function ResellerCard({ listing }: { listing: ScoredListing }) {
  const { analysis } = listing;

  return (
    <Card className="card-hover overflow-hidden">
      <Link href={`/listing/${listing.id}`} className="flex gap-4 p-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-surface-2">
          <Image
            src={listing.photos[0]}
            alt={listing.title}
            fill
            unoptimized
            className="object-cover"
            sizes="96px"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Badge tone="neutral" className="mb-1.5">
                {CATEGORY_LABELS[listing.category]}
              </Badge>
              <h3 className="font-medium leading-snug line-clamp-1">{listing.title}</h3>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-2">Score</p>
              <p className="font-display font-semibold tabular-nums text-accent">
                {analysis.dealScore}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            <MiniStat label="Buy" value={formatCurrency(listing.price)} />
            <MiniStat label="Sell" value={formatCurrency(analysis.estimatedMarketValue)} />
            <MiniStat label="Profit" value={`+${formatCurrency(analysis.estimatedProfit)}`} tone="profit" />
            <MiniStat label="ROI" value={`${analysis.roiPercent}%`} tone="profit" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone={DEMAND_TONE[analysis.demandRating]} icon={<Flame size={11} />}>
              {analysis.demandRating.replace("_", " ")} demand
            </Badge>
            <Badge tone={RISK_TONE[analysis.riskRating]} icon={<ShieldAlert size={11} />}>
              {analysis.riskRating} risk
            </Badge>
            <Badge tone="neutral" icon={<Clock size={11} />}>
              ~{analysis.estimatedSellTimeDays}d to sell
            </Badge>
          </div>
        </div>
      </Link>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "profit";
}) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-surface-2 px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-wide text-muted-2">{label}</p>
      <p className={`text-xs font-display font-semibold tabular-nums ${tone === "profit" ? "text-profit" : ""}`}>
        {value}
      </p>
    </div>
  );
}

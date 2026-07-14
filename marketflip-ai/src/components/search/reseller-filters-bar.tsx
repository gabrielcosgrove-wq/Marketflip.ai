"use client";

import type { SortOption } from "@/types";
import { cn } from "@/lib/utils/format";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "deal_score", label: "Deal Score" },
  { value: "highest_profit", label: "Highest Profit" },
  { value: "highest_roi", label: "Highest ROI" },
  { value: "newest", label: "Newest Listings" },
  { value: "easiest_resale", label: "Easiest Resale" },
];

interface ResellerFiltersBarProps {
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  minProfit: string;
  onMinProfitChange: (v: string) => void;
  maxBuyPrice: string;
  onMaxBuyPriceChange: (v: string) => void;
}

export function ResellerFiltersBar({
  sortBy,
  onSortChange,
  minProfit,
  onMinProfitChange,
  maxBuyPrice,
  onMaxBuyPriceChange,
}: ResellerFiltersBarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              sortBy === opt.value
                ? "border-accent-2/40 bg-accent-2-soft text-accent-2"
                : "border-border text-muted hover:text-foreground hover:border-border-strong"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2">
          <span className="text-xs text-muted-2 whitespace-nowrap">Min profit</span>
          <input
            type="number"
            value={minProfit}
            onChange={(e) => onMinProfitChange(e.target.value)}
            placeholder="$0"
            className="w-20 bg-transparent text-sm outline-none placeholder:text-muted-2"
          />
        </label>
        <label className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2">
          <span className="text-xs text-muted-2 whitespace-nowrap">Max buy price</span>
          <input
            type="number"
            value={maxBuyPrice}
            onChange={(e) => onMaxBuyPriceChange(e.target.value)}
            placeholder="Any"
            className="w-20 bg-transparent text-sm outline-none placeholder:text-muted-2"
          />
        </label>
      </div>
    </div>
  );
}

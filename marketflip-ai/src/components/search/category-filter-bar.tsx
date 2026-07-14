"use client";

import type { Category } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { cn } from "@/lib/utils/format";

const CATEGORIES: Category[] = [
  "electronics",
  "gaming",
  "furniture",
  "bikes",
  "watches",
  "tools",
  "appliances",
  "sporting_goods",
  "collectibles",
  "vehicles",
];

export function CategoryFilterBar({
  selected,
  onSelect,
}: {
  selected: Category | null;
  onSelect: (c: Category | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
          selected === null
            ? "border-accent/40 bg-accent-soft text-accent"
            : "border-border text-muted hover:text-foreground hover:border-border-strong"
        )}
      >
        All
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
            selected === c
              ? "border-accent/40 bg-accent-soft text-accent"
              : "border-border text-muted hover:text-foreground hover:border-border-strong"
          )}
        >
          {CATEGORY_LABELS[c]}
        </button>
      ))}
    </div>
  );
}

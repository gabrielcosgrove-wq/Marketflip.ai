"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DealScoreGauge } from "@/components/charts/deal-score-gauge";
import { formatCurrency } from "@/lib/utils/format";

const SUGGESTIONS = ["Gaming PC", "iPhone", "Mountain Bike", "Rolex", "Couch"];

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(q?: string) {
    const term = q ?? query;
    if (!term.trim()) return;
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <section className="relative overflow-hidden">
      <div className="ambient-glow" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Scanning marketplace listings in real time
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
              Find the deals everyone
              <br />
              else <span className="text-accent">scrolled past.</span>
            </h1>
            <p className="mt-5 text-lg text-muted max-w-xl">
              MarketFlip AI reads every listing like a professional reseller would —
              comparing prices, spotting vague descriptions, and scoring resale
              potential in seconds.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-2"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Try &ldquo;iPhone 14&rdquo; or &ldquo;mountain bike&rdquo;"
                  className="w-full rounded-full border border-border bg-surface pl-11 pr-4 py-3.5 text-sm placeholder:text-muted-2 focus:border-accent/50 outline-none transition-colors"
                />
              </div>
              <Button size="lg" onClick={() => handleSearch()} className="shrink-0">
                Find deals <ArrowRight size={16} />
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground hover:border-border-strong transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Example deal reveal card - the "thesis" of the hero */}
          <div className="relative">
            <div className="relative rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-2xl shadow-black/40 rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-2 mb-1">Gaming PC · Austin, TX</p>
                  <h3 className="font-medium">RTX 4070 Custom Build</h3>
                </div>
                <DealScoreGauge score={92} size={72} strokeWidth={6} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Stat label="Price" value={formatCurrency(450)} />
                <Stat label="Est. Value" value={formatCurrency(700)} accent />
                <Stat label="Profit" value={`+${formatCurrency(250)}`} profit />
                <Stat label="ROI" value="55%" profit />
              </div>

              <div className="mt-5 pt-5 border-t border-border-subtle">
                <p className="text-xs font-medium text-muted mb-2">Why this is undervalued</p>
                <ul className="space-y-1.5 text-xs text-muted">
                  <li>• Similar listings sell for around $700</li>
                  <li>• Recently listed — low competition</li>
                  <li>• Seller description is vague</li>
                  <li>• Good condition, no red flags</li>
                </ul>
              </div>
            </div>
            <div className="absolute -z-10 -bottom-6 -right-6 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
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
    <div className="rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-2">{label}</p>
      <p
        className={`font-display font-semibold tabular-nums ${
          profit ? "text-profit" : accent ? "text-accent" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

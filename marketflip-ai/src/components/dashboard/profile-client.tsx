"use client";

import { useEffect, useState, useMemo } from "react";
import { useDashboardStore } from "@/store/dashboard-store";
import { Card } from "@/components/ui/card";
import { CATEGORY_LABELS } from "@/types";
import type { ScoredListing, Category } from "@/types";
import { formatCurrency } from "@/lib/utils/format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DollarSign, TrendingUp, Eye, Star } from "lucide-react";

const CHART_COLORS = ["#5eead4", "#a78bfa", "#34d399", "#f59e0b", "#f87171", "#60a5fa", "#f472b6", "#facc15"];

export function ProfileClient() {
  const { records } = useDashboardStore();
  const [allListings, setAllListings] = useState<ScoredListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => setAllListings(data.results ?? []))
      .finally(() => setLoading(false));
  }, []);

  const viewedListings = useMemo(
    () => records.viewed.map((id) => allListings.find((l) => l.id === id)).filter((l): l is ScoredListing => Boolean(l)),
    [records.viewed, allListings]
  );
  const savedListings = useMemo(
    () => records.saved.map((id) => allListings.find((l) => l.id === id)).filter((l): l is ScoredListing => Boolean(l)),
    [records.saved, allListings]
  );

  const totalMoneySaved = savedListings.reduce((sum, l) => sum + Math.max(0, l.analysis.estimatedMarketValue - l.price), 0);
  const totalProfitFound = viewedListings.reduce((sum, l) => sum + l.analysis.estimatedProfit, 0);
  const dealsViewed = records.viewed.length;

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<Category, number>> = {};
    for (const l of viewedListings) {
      counts[l.category] = (counts[l.category] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([category, count]) => ({ category: category as Category, count: count as number }))
      .sort((a, b) => b.count - a.count);
  }, [viewedListings]);

  const chartData = categoryCounts.map((c) => ({
    name: CATEGORY_LABELS[c.category],
    value: c.count,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
          Profile
        </h1>
        <p className="text-muted">Your activity and impact using MarketFlip AI.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={DollarSign}
          label="Money saved on buys"
          value={formatCurrency(totalMoneySaved)}
          tone="profit"
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          label="Estimated profit found"
          value={formatCurrency(totalProfitFound)}
          tone="accent"
          loading={loading}
        />
        <StatCard icon={Eye} label="Deals viewed" value={String(dealsViewed)} loading={loading} />
        <StatCard icon={Star} label="Deals saved" value={String(savedListings.length)} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
        <Card className="p-6">
          <h2 className="font-medium mb-4">Favorite categories</h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-2 py-12 text-center">
              View a few listings to see your category breakdown.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="var(--surface)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {chartData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                {c.name}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-medium mb-4">Recent activity</h2>
          {viewedListings.length === 0 ? (
            <p className="text-sm text-muted-2 py-12 text-center">No listings viewed yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {viewedListings.slice(0, 6).map((l) => (
                <a
                  key={l.id}
                  href={`/listing/${l.id}`}
                  className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border px-4 py-3 hover:border-border-strong transition-colors"
                >
                  <span className="text-sm line-clamp-1">{l.title}</span>
                  <span className="text-xs font-display font-semibold text-accent tabular-nums shrink-0 ml-3">
                    {l.analysis.dealScore}/100
                  </span>
                </a>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  loading,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  tone?: "profit" | "accent";
  loading?: boolean;
}) {
  return (
    <Card className="p-5">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full mb-3 ${
          tone === "profit" ? "bg-profit-soft text-profit" : tone === "accent" ? "bg-accent-soft text-accent" : "bg-surface-2 text-muted"
        }`}
      >
        <Icon size={16} />
      </span>
      <p className="text-xs text-muted-2 mb-1">{label}</p>
      {loading ? (
        <div className="h-6 w-20 rounded skeleton" />
      ) : (
        <p className="font-display text-xl font-semibold tabular-nums">{value}</p>
      )}
    </Card>
  );
}

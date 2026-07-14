import Link from "next/link";
import type { Category } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import {
  Smartphone,
  Gamepad2,
  Sofa,
  Bike,
  Watch,
  Wrench,
  Refrigerator,
  Dumbbell,
  Trophy,
  Car,
} from "lucide-react";

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ size?: number }>> = {
  electronics: Smartphone,
  gaming: Gamepad2,
  furniture: Sofa,
  bikes: Bike,
  watches: Watch,
  tools: Wrench,
  appliances: Refrigerator,
  sporting_goods: Dumbbell,
  collectibles: Trophy,
  vehicles: Car,
};

const FEATURED: Category[] = [
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

export function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-wider text-accent-2 font-medium mb-2">
            Browse
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Categories with the most flip potential
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {FEATURED.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <Link
              key={cat}
              href={`/search?category=${cat}`}
              className="group flex flex-col items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-6 text-center card-hover"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted group-hover:text-accent group-hover:bg-accent-soft transition-colors">
                <Icon size={20} />
              </span>
              <span className="text-sm font-medium">{CATEGORY_LABELS[cat]}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

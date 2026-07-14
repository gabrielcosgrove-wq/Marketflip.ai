import { ScanSearch, Calculator, ShieldCheck, TrendingUp } from "lucide-react";

const STEPS = [
  {
    icon: ScanSearch,
    title: "Scans the listing",
    body: "Reads the title, description, photos, price, and condition — the same signals an experienced flipper would look for.",
  },
  {
    icon: Calculator,
    title: "Compares the market",
    body: "Cross-references similar sold items and active listings to estimate a realistic resale value, not just an average.",
  },
  {
    icon: ShieldCheck,
    title: "Scores confidence & risk",
    body: "Flags vague descriptions, missing photos, and condition issues that affect how reliable the estimate is.",
  },
  {
    icon: TrendingUp,
    title: "Surfaces the upside",
    body: "Combines profit, ROI, and how fast similar items sell into a single Deal Score from 0–100.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-2xl mb-12">
        <p className="text-xs uppercase tracking-wider text-accent font-medium mb-2">
          How it works
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Every listing gets the same scrutiny a pro reseller would give it
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="rounded-[var(--radius-md)] border border-border bg-surface p-5 card-hover"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                <step.icon size={18} />
              </span>
              <span className="text-xs text-muted-2 tabular-nums">0{i + 1}</span>
            </div>
            <h3 className="font-medium mb-1.5">{step.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

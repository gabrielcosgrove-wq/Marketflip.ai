import { cn } from "@/lib/utils/format";
import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "profit" | "risk" | "danger" | "violet";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-3 text-muted border-border",
  accent: "bg-accent-soft text-accent border-accent/20",
  profit: "bg-profit-soft text-profit border-profit/20",
  risk: "bg-risk-soft text-risk border-risk/20",
  danger: "bg-danger-soft text-danger border-danger/20",
  violet: "bg-accent-2-soft text-accent-2 border-accent-2/20",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

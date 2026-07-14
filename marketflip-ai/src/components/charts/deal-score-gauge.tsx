"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/format";

interface DealScoreGaugeProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return "var(--profit)";
  if (score >= 60) return "var(--accent)";
  if (score >= 40) return "var(--risk)";
  return "var(--danger)";
}

/**
 * The signature visual motif of MarketFlip AI: a radial arc gauge representing
 * the AI Deal Score. Appears on listing cards, hero examples, and the
 * analysis page so the score always reads the same way at a glance.
 */
export function DealScoreGauge({
  score,
  size = 88,
  strokeWidth = 7,
  showLabel = true,
  className,
}: DealScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let raf: number;
    const duration = 900;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc spans 270 degrees (like a speedometer), starting at -225deg
  const arcFraction = 0.75;
  const arcLength = circumference * arcFraction;
  const dashOffset = arcLength - (animatedScore / 100) * arcLength;
  const color = scoreColor(score);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-[225deg]"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke 0.3s ease" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display font-semibold tabular-nums leading-none"
            style={{ fontSize: size * 0.26, color }}
          >
            {animatedScore}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-muted-2 mt-0.5">
            / 100
          </span>
        </div>
      )}
    </div>
  );
}

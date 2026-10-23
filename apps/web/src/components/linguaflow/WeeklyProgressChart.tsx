"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface WeeklyProgressChartProps {
  days?: { label: string; xp: number }[];
  percentageChange?: string;
}

export function WeeklyProgressChart({
  days = [
    { label: "Tue", xp: 420 },
    { label: "Wed", xp: 260 },
    { label: "Thu", xp: 580 },
    { label: "Fri", xp: 390 },
    { label: "Sat", xp: 820 },
    { label: "Sun", xp: 510 },
  ],
  percentageChange = "+24% this week",
}: WeeklyProgressChartProps) {
  const { t } = useLanguage();

  // SVG dimensions & smooth Bezier path calculation
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const maxXp = Math.max(...days.map((d) => d.xp), 1000);
  const minXp = 0;

  const points = days.map((d, i) => {
    const x = paddingX + (i / (days.length - 1)) * (width - 2 * paddingX);
    const y =
      height -
      paddingY -
      ((d.xp - minXp) / (maxXp - minXp)) * (height - 2 * paddingY);
    return { x, y, label: d.label, xp: d.xp };
  });

  // Build cubic Bezier curve string
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    height - 10
  } L ${points[0].x} ${height - 10} Z`;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0D0920] border border-[#1F1538] shadow-sm space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            {t.flowDashboard.weeklyProgress.title}
          </h3>
          <p className="text-xs text-[#9286C7] mt-0.5">
            {t.flowDashboard.weeklyProgress.subtitle}
          </p>
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#8B20F5]/20 text-[#A855F7] border border-[#8B20F5]/30">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{percentageChange || t.flowDashboard.weeklyProgress.badge}</span>
        </div>
      </div>

      {/* SVG Smooth Line & Area Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-40 sm:h-44 overflow-visible"
        >
          <defs>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B20F5" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#A855F7" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0D0920" stopOpacity="0.0" />
            </linearGradient>

            <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#purpleGradient)" />

          {/* Stroke Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#A855F7"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#purpleGlow)"
          />

          {/* Peak Point Glowing Dot on Highest Day */}
          {points.length > 0 && (
            <circle
              cx={points[4]?.x || points[0].x}
              cy={points[4]?.y || points[0].y}
              r="5"
              fill="#FFFFFF"
              stroke="#8B20F5"
              strokeWidth="3"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Weekday Labels */}
        <div className="flex justify-between px-6 pt-2 text-[11px] font-medium text-[#9286C7]">
          {days.map((d, i) => (
            <span
              key={i}
              className={i === 4 ? "text-white font-bold" : "hover:text-white"}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}


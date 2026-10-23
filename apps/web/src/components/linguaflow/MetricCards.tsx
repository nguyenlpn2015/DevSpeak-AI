"use client";

import React from "react";
import { Flame, Zap, BookOpen, Trophy, ArrowUpRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface MetricCardsProps {
  dayStreak?: number;
  totalXP?: string | number;
  wordsLearned?: number;
  level?: number;
}

export function MetricCards({
  dayStreak = 12,
  totalXP = "2.840",
  wordsLearned = 184,
  level = 6,
}: MetricCardsProps) {
  const { t } = useLanguage();

  const metrics = [
    {
      id: "streak",
      value: dayStreak,
      label: t.flowDashboard.metrics.dayStreak,
      tag: "12d Active",
      icon: <Flame className="w-5 h-5 text-[#FF7A00] fill-current" />,
      iconBg: "bg-gradient-to-br from-[#FF7A00]/25 to-[#FF5500]/10 text-[#FF7A00] border-[#FF7A00]/30",
      borderColor: "hover:border-[#FF7A00]/50 hover:shadow-[#FF7A00]/10",
      accentGlow: "from-[#FF7A00]/10 to-transparent",
    },
    {
      id: "xp",
      value: totalXP,
      label: t.flowDashboard.metrics.totalXP,
      tag: "Top 5% SRE",
      icon: <Zap className="w-5 h-5 text-[#F59E0B] fill-current" />,
      iconBg: "bg-gradient-to-br from-[#F59E0B]/25 to-[#D97706]/10 text-[#F59E0B] border-[#F59E0B]/30",
      borderColor: "hover:border-[#F59E0B]/50 hover:shadow-[#F59E0B]/10",
      accentGlow: "from-[#F59E0B]/10 to-transparent",
    },
    {
      id: "words",
      value: wordsLearned,
      label: t.flowDashboard.metrics.wordsLearned,
      tag: "+14 tuần này",
      icon: <BookOpen className="w-5 h-5 text-[#A855F7]" />,
      iconBg: "bg-gradient-to-br from-[#8B20F5]/25 to-[#7015D1]/10 text-[#A855F7] border-[#8B20F5]/30",
      borderColor: "hover:border-[#8B20F5]/50 hover:shadow-[#8B20F5]/10",
      accentGlow: "from-[#8B20F5]/10 to-transparent",
    },
    {
      id: "level",
      value: level,
      label: t.flowDashboard.metrics.level,
      tag: "B2 Master",
      icon: <Trophy className="w-5 h-5 text-[#EC007A]" />,
      iconBg: "bg-gradient-to-br from-[#EC007A]/25 to-[#BE185D]/10 text-[#EC007A] border-[#EC007A]/30",
      borderColor: "hover:border-[#EC007A]/50 hover:shadow-[#EC007A]/10",
      accentGlow: "from-[#EC007A]/10 to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div
          key={m.id}
          className={`relative overflow-hidden p-5 rounded-2xl bg-[#0D0920] border border-[#1F1538] transition-all duration-300 ${m.borderColor} shadow-sm hover:shadow-lg hover:-translate-y-0.5 space-y-3 group cursor-default`}
        >
          {/* Subtle Accent Glow */}
          <div
            className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${m.accentGlow} blur-xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`}
          />

          {/* Top row: Icon Badge + Micro Tag */}
          <div className="flex items-center justify-between relative z-10">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center border shadow-sm ${m.iconBg}`}
            >
              {m.icon}
            </div>

            <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-[#160F2E] text-[#9286C7] border border-[#1F1538]">
              {m.tag}
            </span>
          </div>

          {/* Bottom row: Value & Label */}
          <div className="relative z-10">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight block">
              {m.value}
            </span>
            <span className="text-xs text-[#9286C7] font-medium mt-1 block">
              {m.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import React from "react";
import {
  Layers,
  GitBranch,
  Cloud,
  Terminal,
  ShieldAlert,
  Box,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Cpu,
} from "lucide-react";
import { Topic } from "@/types";
import { useLanguage } from "@/i18n/LanguageContext";

interface DashboardHomeProps {
  onSelectCategory: (topic: Topic) => void;
  onExploreAll: () => void;
  totalQuestions: number;
}

const CATEGORY_ITEMS: {
  topic: Topic;
  icon: React.ReactNode;
  badgeColor: string;
}[] = [
  {
    topic: "kubernetes",
    icon: <Layers className="w-5 h-5 text-blue-400" />,
    badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  },
  {
    topic: "cicd",
    icon: <GitBranch className="w-5 h-5 text-emerald-400" />,
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  },
  {
    topic: "aws",
    icon: <Cloud className="w-5 h-5 text-amber-400" />,
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  },
  {
    topic: "linux_sre",
    icon: <Terminal className="w-5 h-5 text-purple-400" />,
    badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  },
  {
    topic: "behavioral",
    icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
    badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  },
  {
    topic: "docker",
    icon: <Box className="w-5 h-5 text-cyan-400" />,
    badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  },
];

export function DashboardHome({
  onSelectCategory,
  onExploreAll,
  totalQuestions,
}: DashboardHomeProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-10 py-2">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-brand-950/40 to-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-5 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>{t.dashboard.heroBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {t.dashboard.heroTitle}
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            {t.dashboard.heroDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={onExploreAll}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all inline-flex items-center justify-center cursor-pointer"
            >
              {t.dashboard.exploreCta} ({totalQuestions})
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 px-4 py-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t.dashboard.costOfflineBadge}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Categories Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.dashboard.categoriesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {t.dashboard.categoriesSubtitle}
            </p>
          </div>
          <button
            onClick={onExploreAll}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 inline-flex items-center cursor-pointer"
          >
            {t.dashboard.viewAllCategories} <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORY_ITEMS.map((cat) => {
            const data = t.dashboard.categories[cat.topic];
            return (
              <div
                key={cat.topic}
                onClick={() => onSelectCategory(cat.topic)}
                className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 cursor-pointer transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition-colors">
                      {cat.icon}
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cat.badgeColor}`}
                    >
                      {data?.badge || cat.topic}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                      {data?.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {data?.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-brand-300">
                  <span>{t.dashboard.startPractice}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Engineering Coaching Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>{t.dashboard.highlights.technicalAccuracyTitle}</span>
          </div>
          <h4 className="text-sm font-bold text-white">{t.dashboard.highlights.technicalAccuracyTitle}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.dashboard.highlights.technicalAccuracyDesc}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>{t.dashboard.highlights.starTitle}</span>
          </div>
          <h4 className="text-sm font-bold text-white">{t.dashboard.highlights.starTitle}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.dashboard.highlights.starDesc}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>{t.dashboard.highlights.scoringTitle}</span>
          </div>
          <h4 className="text-sm font-bold text-white">{t.dashboard.highlights.scoringTitle}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.dashboard.highlights.scoringDesc}
          </p>
        </div>
      </section>
    </div>
  );
}

"use client";

import React from "react";
import { Sparkles, Plus, CheckCircle, Info, FileText } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface STARBuilderProps {
  isStarRecommended: boolean;
  onInsertSection: (text: string) => void;
  onInsertAll: () => void;
}

export function STARBuilder({
  isStarRecommended,
  onInsertSection,
  onInsertAll,
}: STARBuilderProps) {
  const { t } = useLanguage();

  const steps = [
    {
      letter: "S",
      title: t.studio.starBuilder.situationTitle,
      desc: t.studio.starBuilder.situationDesc,
      starter: t.studio.starBuilder.situationStarter,
      badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      accentBg: "border-cyan-500/20",
    },
    {
      letter: "T",
      title: t.studio.starBuilder.taskTitle,
      desc: t.studio.starBuilder.taskDesc,
      starter: t.studio.starBuilder.taskStarter,
      badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
      accentBg: "border-indigo-500/20",
    },
    {
      letter: "A",
      title: t.studio.starBuilder.actionTitle,
      desc: t.studio.starBuilder.actionDesc,
      starter: t.studio.starBuilder.actionStarter,
      badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/30",
      accentBg: "border-purple-500/20",
    },
    {
      letter: "R",
      title: t.studio.starBuilder.resultTitle,
      desc: t.studio.starBuilder.resultDesc,
      starter: t.studio.starBuilder.resultStarter,
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      accentBg: "border-emerald-500/20",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header & Recommendation Badge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-400" />
            {t.studio.starBuilder.title}
          </h3>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              isStarRecommended
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {isStarRecommended
              ? t.studio.starBuilder.recommendedBadge
              : t.studio.starBuilder.optionalBadge}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {t.studio.starBuilder.subtitle}
        </p>
      </div>

      {/* Top CTA to Insert Entire Framework */}
      <button
        type="button"
        onClick={onInsertAll}
        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>{t.studio.starBuilder.insertAll}</span>
      </button>

      {/* 4 Connected Step Cards */}
      <div className="relative pl-3 space-y-3 before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`relative p-3.5 rounded-xl bg-slate-950/90 border ${step.accentBg} hover:border-slate-700 transition-all space-y-2`}
          >
            {/* Step header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className={`h-6 w-6 rounded-md flex items-center justify-center font-bold font-mono text-xs border ${step.badgeColor}`}
                >
                  {step.letter}
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {step.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onInsertSection(`${step.letter} (${step.title}):\n${step.starter}`)}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 hover:bg-slate-800 text-brand-300 hover:text-white border border-slate-800 transition-colors inline-flex items-center cursor-pointer"
              >
                <Plus className="w-3 h-3 mr-1" />
                {t.studio.starBuilder.insertStep}
              </button>
            </div>

            {/* Description */}
            <p className="text-[11px] text-slate-400 leading-relaxed pl-8">
              {step.desc}
            </p>

            {/* Starter sentence preview */}
            <div className="ml-8 p-2 rounded-lg bg-slate-900/70 border border-slate-800/60 text-[11px] text-slate-300 italic font-sans leading-relaxed">
              &ldquo;{step.starter}&rdquo;
            </div>
          </div>
        ))}
      </div>

      {/* Senior Interview Pro Tip */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start space-x-2 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-200">Pro-Tip:</strong> International hiring managers listen for personal accountability: say <em>&ldquo;I designed... I deployed... I diagnosed...&rdquo;</em> for the Action section rather than generic &ldquo;we&rdquo;.
        </p>
      </div>
    </div>
  );
}


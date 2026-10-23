"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Shield, BookOpen } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface RubricPanelProps {
  criteria: string[];
  pitfalls: string[];
}

export function RubricPanel({ criteria, pitfalls }: RubricPanelProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-brand-400" />
          {t.studio.rubricPanel.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {t.studio.rubricPanel.subtitle}
        </p>
      </div>

      {/* Evaluation Criteria */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {t.studio.rubricPanel.criteriaHeading}
        </h4>
        <ul className="space-y-2">
          {criteria.map((item, idx) => (
            <li
              key={idx}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start space-x-2.5"
            >
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Common Pitfalls */}
      {pitfalls.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t.studio.rubricPanel.pitfallsHeading}
          </h4>
          <ul className="space-y-2">
            {pitfalls.map((pitfall, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed flex items-start space-x-2.5"
              >
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">!</span>
                <span>{pitfall}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Architectural Guarantee */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 flex items-start space-x-2 text-[10px] text-slate-500">
        <Shield className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-tight">
          Rubric standards are defined in repository schemas and evaluated deterministically.
        </p>
      </div>
    </div>
  );
}


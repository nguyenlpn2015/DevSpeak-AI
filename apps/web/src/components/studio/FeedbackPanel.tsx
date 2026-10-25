"use client";

import React, { useState } from "react";
import { FeedbackReport, Question } from "@/types";
import {
  Award,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  Edit3,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface FeedbackPanelProps {
  report: FeedbackReport;
  question: Question;
  onRefineAnswer: () => void;
  onRetry: () => void;
  onNextQuestion?: () => void;
  hasNextQuestion: boolean;
  onSelectFollowup?: (text: string) => void;
}

export function FeedbackPanel({
  report,
  question,
  onRefineAnswer,
  onRetry,
  onNextQuestion,
  hasNextQuestion,
  onSelectFollowup,
}: FeedbackPanelProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"technical" | "grammar" | "structure">("technical");
  const [copied, setCopied] = useState<boolean>(false);

  const overall = report.scores.overall_score;
  const isHigh = overall >= 8.0;
  const isMid = overall >= 6.0;

  const scoreBadgeColor = isHigh
    ? "from-emerald-500 to-teal-600 border-emerald-400 text-emerald-100 shadow-emerald-500/20"
    : isMid
    ? "from-brand-600 to-indigo-600 border-indigo-400 text-indigo-100 shadow-indigo-500/20"
    : "from-amber-600 to-orange-600 border-amber-400 text-amber-100 shadow-amber-500/20";

  const tierText = isHigh
    ? t.feedback.strongTier
    : isMid
    ? t.feedback.solidTier
    : t.feedback.developingTier;

  const handleCopyModel = () => {
    navigator.clipboard.writeText(report.model_answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Learning Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={onRefineAnswer}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all inline-flex items-center space-x-1 shadow-sm cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t.studio.refineAnswer}</span>
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-750 transition-colors inline-flex items-center space-x-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.studio.tryAgain}</span>
          </button>
        </div>

        {hasNextQuestion && onNextQuestion && (
          <button
            type="button"
            onClick={onNextQuestion}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all inline-flex items-center space-x-1 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <span>{t.studio.nextQuestion}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Hero Performance Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-4">
          <div
            className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${scoreBadgeColor} flex flex-col items-center justify-center shadow-lg border-2 shrink-0`}
          >
            <span className="text-2xl font-black tracking-tight">{overall}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">
              Score / 10
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.feedback.overallScore}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">
              {tierText}
            </h3>
            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
              Scored against rubric keywords, technical accuracy, and English communication standards.
            </p>
          </div>
        </div>

        {/* 3 Dimension Progress Bars */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
          {/* Technical */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-300 font-medium">{t.feedback.technicalAccuracy}</span>
              <span className="text-white font-mono font-bold">
                {report.scores.technical_score}/10
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${report.scores.technical_score * 10}%` }}
              />
            </div>
          </div>

          {/* Grammar & Tone */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-300 font-medium">{t.feedback.grammarTone}</span>
              <span className="text-white font-mono font-bold">
                {report.scores.grammar_score}/10
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${report.scores.grammar_score * 10}%` }}
              />
            </div>
          </div>

          {/* Structure & Clarity */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-300 font-medium">{t.feedback.starClarity}</span>
              <span className="text-white font-mono font-bold">
                {report.scores.clarity_score}/10
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${report.scores.clarity_score * 10}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categorized Detailed Feedback Tabs */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center space-x-1.5 border-b border-slate-800 pb-2.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("technical")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer shrink-0 ${
              activeTab === "technical"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{t.feedback.tabTechnical}</span>
            <span className="ml-1 text-[10px] opacity-80">({report.feedback?.technical_feedback?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("grammar")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer shrink-0 ${
              activeTab === "grammar"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Lightbulb className="w-3 h-3" />
            <span>{t.feedback.tabGrammar}</span>
            <span className="ml-1 text-[10px] opacity-80">({report.feedback?.grammar_feedback?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("structure")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer shrink-0 ${
              activeTab === "structure"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>{t.feedback.tabStructure}</span>
            <span className="ml-1 text-[10px] opacity-80">({report.feedback?.clarity_structure_feedback?.length || 0})</span>
          </button>
        </div>

        {/* Tab Item List */}
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {activeTab === "technical" &&
            report.feedback.technical_feedback.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-2.5 text-xs text-slate-200 leading-relaxed"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}

          {activeTab === "grammar" &&
            report.feedback.grammar_feedback.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-2.5 text-xs text-slate-200 leading-relaxed"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}

          {activeTab === "structure" &&
            report.feedback.clarity_structure_feedback.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-2.5 text-xs text-slate-200 leading-relaxed"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Benchmark Canonical Model Answer */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.feedback.benchmarkAnswer}
            </h4>
          </div>
          <button
            type="button"
            onClick={handleCopyModel}
            className="inline-flex items-center text-[11px] text-slate-400 hover:text-white transition-colors bg-slate-950 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-emerald-400" />
                {t.feedback.copiedBenchmark}
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                {t.feedback.copyBenchmark}
              </>
            )}
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 text-xs text-slate-200 leading-relaxed font-sans max-h-56 overflow-y-auto">
          {report.model_answer}
        </div>
      </div>

      {/* Probing Follow-Up Questions */}
      {report.suggested_followups && report.suggested_followups.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2.5">
          <div className="flex items-center space-x-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.feedback.followupsHeading}
            </h4>
          </div>
          <div className="space-y-2">
            {report.suggested_followups.map((followup, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between group"
              >
                <span className="text-xs text-slate-300 group-hover:text-white leading-relaxed">
                  &ldquo;{followup}&rdquo;
                </span>
                {onSelectFollowup && (
                  <button
                    type="button"
                    onClick={() => onSelectFollowup(followup)}
                    className="ml-2 shrink-0 text-[11px] font-semibold text-brand-400 group-hover:text-brand-300 inline-flex items-center cursor-pointer"
                  >
                    <span>Practice</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transparency Disclaimer */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 flex items-start space-x-2 text-[10px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{report.disclaimer}</p>
      </div>
    </div>
  );
}


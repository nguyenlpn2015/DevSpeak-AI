"use client";

import React, { useState } from "react";
import { FeedbackReport, Question } from "@/types";
import {
  Award,
  CheckCircle2,
  Lightbulb,
  Copy,
  Check,
  RotateCcw,
  List,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface FeedbackStudioProps {
  report: FeedbackReport;
  question: Question;
  onRetry: () => void;
  onBackToCatalog: () => void;
  onSelectFollowup?: (followupText: string) => void;
}

export function FeedbackStudio({
  report,
  question,
  onRetry,
  onBackToCatalog,
  onSelectFollowup,
}: FeedbackStudioProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"technical" | "grammar" | "structure">("technical");

  const overall = report.scores.overall_score;
  const isHigh = overall >= 8.0;
  const isMid = overall >= 6.0;

  const scoreBadgeColor = isHigh
    ? "from-emerald-500 to-teal-600 border-emerald-400 text-emerald-100"
    : isMid
    ? "from-brand-600 to-indigo-600 border-indigo-400 text-indigo-100"
    : "from-amber-600 to-orange-600 border-amber-400 text-amber-100";

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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
            {t.feedback.reportBadge}
          </span>
          <h2 className="text-xl font-bold text-white">{question.title}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> {t.feedback.retryBtn}
          </button>
          <button
            onClick={onBackToCatalog}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-600 hover:bg-brand-500 text-white transition-colors cursor-pointer"
          >
            <List className="w-3.5 h-3.5 mr-1" /> {t.feedback.backToCatalogBtn}
          </button>
        </div>
      </div>

      {/* Hero Score Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Main Score Badge */}
          <div className="flex items-center space-x-5">
            <div
              className={`h-24 w-24 rounded-2xl bg-gradient-to-br ${scoreBadgeColor} flex flex-col items-center justify-center shadow-xl border-2 shrink-0`}
            >
              <span className="text-3xl font-black tracking-tight">{overall}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">
                Score / 10
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t.feedback.overallScore}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">{tierText}</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Evaluated against the question&apos;s technical key concepts, STAR narrative markers, and
                professional technical English conventions.
              </p>
            </div>
          </div>

          {/* Granular Dimension Bars */}
          <div className="w-full md:w-80 space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            {/* Technical */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">{t.feedback.technicalAccuracy}</span>
                <span className="text-white font-mono font-bold">
                  {report.scores.technical_score}/10
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${report.scores.technical_score * 10}%` }}
                />
              </div>
            </div>

            {/* Grammar & Fluency */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">{t.feedback.grammarTone}</span>
                <span className="text-white font-mono font-bold">
                  {report.scores.grammar_score}/10
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${report.scores.grammar_score * 10}%` }}
                />
              </div>
            </div>

            {/* Clarity & Structure */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">{t.feedback.starClarity}</span>
                <span className="text-white font-mono font-bold">
                  {report.scores.clarity_score}/10
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${report.scores.clarity_score * 10}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categorized Detailed Feedback */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        {/* Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("technical")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "technical"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.feedback.tabTechnical} ({report.feedback.technical_feedback.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("grammar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "grammar"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{t.feedback.tabGrammar} ({report.feedback.grammar_feedback.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("structure")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "structure"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.feedback.tabStructure} ({report.feedback.clarity_structure_feedback.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[120px] space-y-2.5">
          {activeTab === "technical" && (
            <div className="space-y-2">
              {report.feedback.technical_feedback.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-3 text-xs sm:text-sm text-slate-200 leading-relaxed"
                >
                  <Sparkles className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "grammar" && (
            <div className="space-y-2">
              {report.feedback.grammar_feedback.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-3 text-xs sm:text-sm text-slate-200 leading-relaxed"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "structure" && (
            <div className="space-y-2">
              {report.feedback.clarity_structure_feedback.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-3 text-xs sm:text-sm text-slate-200 leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Benchmark Canonical Answer */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white">
              {t.feedback.benchmarkAnswer}
            </h3>
          </div>
          <button
            onClick={handleCopyModel}
            className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors bg-slate-950 px-2.5 py-1 rounded border border-slate-800 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> {t.feedback.copiedBenchmark}
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" /> {t.feedback.copyBenchmark}
              </>
            )}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          {report.model_answer}
        </div>
      </div>

      {/* Suggested Probing Follow-Up Questions */}
      {report.suggested_followups && report.suggested_followups.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              {t.feedback.followupsHeading}
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Interviewers frequently follow up with these specific scenarios based on your topic.
          </p>

          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {report.suggested_followups.map((followup, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-brand-500/50 transition-all flex items-center justify-between group"
              >
                <span className="text-xs sm:text-sm text-slate-300 group-hover:text-white">
                  &ldquo;{followup}&rdquo;
                </span>
                {onSelectFollowup && (
                  <button
                    onClick={() => onSelectFollowup(followup)}
                    className="ml-3 shrink-0 text-xs font-semibold text-brand-400 group-hover:text-brand-300 inline-flex items-center cursor-pointer"
                  >
                    Practice <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heuristic Mock Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/60 flex items-start space-x-2.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{report.disclaimer}</p>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { QuestionSummary } from "@/types";
import {
  Terminal,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface SessionSidebarProps {
  questions: QuestionSummary[];
  currentQuestionId: string;
  evaluatedQuestionIds: Set<string>;
  onSelectQuestion: (id: string) => void;
  onBackToCatalog: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function SessionSidebar({
  questions,
  currentQuestionId,
  evaluatedQuestionIds,
  onSelectQuestion,
  onBackToCatalog,
  isCollapsed,
  onToggleCollapse,
}: SessionSidebarProps) {
  const { t } = useLanguage();

  const totalQuestions = questions.length;
  const completedCount = evaluatedQuestionIds.size;
  const currentIndex = questions.findIndex((q) => q.id === currentQuestionId);
  const currentNum = currentIndex >= 0 ? currentIndex + 1 : 1;

  return (
    <aside
      aria-label={t.studio.questionsNav}
      className={`relative flex flex-col bg-slate-900/90 border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0 select-none ${
        isCollapsed ? "w-16" : "w-72 lg:w-80"
      }`}
    >
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-2">
        {!isCollapsed && (
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
              <Terminal className="h-4 w-4 text-white" />
            </div>
            <div className="truncate">
              <h2 className="text-xs font-bold tracking-tight text-white uppercase truncate flex items-center gap-1.5">
                <span>{t.studio.badge}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {t.studio.sessionProgress
                  .replace("{current}", String(currentNum))
                  .replace("{total}", String(totalQuestions || 6))}
              </p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-md">
              <Terminal className="h-4 w-4 text-white" />
            </div>
          </div>
        )}

        {/* Collapse / Expand Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? t.studio.expandNav : t.studio.collapseNav}
          aria-label={isCollapsed ? t.studio.expandNav : t.studio.collapseNav}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/50"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Progress Track */}
      {!isCollapsed && (
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">
            {completedCount} / {totalQuestions || 6} {t.studio.questionStatus.completed}
          </span>
          <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{
                width: `${
                  totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Question List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 focus:outline-none">
        {questions.map((q, idx) => {
          const isCurrent = q.id === currentQuestionId;
          const isEvaluated = evaluatedQuestionIds.has(q.id);

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectQuestion(q.id)}
              title={`${q.title} (${q.difficulty})`}
              className={`w-full text-left rounded-xl transition-all cursor-pointer flex items-center ${
                isCollapsed
                  ? "p-2.5 justify-center"
                  : "p-3 space-x-3"
              } ${
                isCurrent
                  ? "bg-brand-950/70 border border-brand-500/50 text-white shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/30"
                  : isEvaluated
                  ? "bg-slate-950/60 border border-emerald-900/40 text-slate-300 hover:bg-slate-850 hover:text-white"
                  : "bg-slate-950/40 border border-slate-800/60 text-slate-400 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              {/* Question Number Badge */}
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                  isCurrent
                    ? "bg-brand-600 text-white"
                    : isEvaluated
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                    : "bg-slate-900 text-slate-400 border border-slate-800"
                }`}
              >
                {idx + 1}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-400 truncate">
                      {q.topic.replace("_", " ")}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium capitalize ${
                        q.difficulty === "senior"
                          ? "bg-purple-950/80 text-purple-300 border border-purple-800/40"
                          : q.difficulty === "mid"
                          ? "bg-indigo-950/80 text-indigo-300 border border-indigo-800/40"
                          : "bg-teal-950/80 text-teal-300 border border-teal-800/40"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xs font-medium text-slate-200 truncate leading-snug">
                    {q.title}
                  </h3>
                  <div className="flex items-center space-x-1.5 mt-1 text-[10px]">
                    {isCurrent ? (
                      <span className="inline-flex items-center text-brand-300 font-semibold">
                        <Sparkles className="w-3 h-3 mr-1 text-brand-400 shrink-0" />
                        {t.studio.questionStatus.current}
                      </span>
                    ) : isEvaluated ? (
                      <span className="inline-flex items-center text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400 shrink-0" />
                        {t.studio.questionStatus.completed}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-slate-500">
                        <Circle className="w-2.5 h-2.5 mr-1 text-slate-600 shrink-0" />
                        {t.studio.questionStatus.unanswered}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Return to Catalog Action */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <button
          type="button"
          onClick={onBackToCatalog}
          title={t.studio.exitStudio}
          className={`w-full py-2 px-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-850 text-slate-400 hover:text-white text-xs font-medium transition-colors flex items-center justify-center cursor-pointer ${
            isCollapsed ? "p-2" : "space-x-1.5"
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span className="truncate">{t.studio.exitStudio}</span>}
        </button>
      </div>
    </aside>
  );
}


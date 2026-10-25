"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Question, QuestionSummary, FeedbackReport } from "@/types";
import {
  Clock,
  Sparkles,
  Send,
  Eye,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Layers,
  Trash2,
  Command,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { SessionSidebar } from "./SessionSidebar";
import { VocabularyCoach } from "./VocabularyCoach";
import { STARBuilder } from "./STARBuilder";
import { RubricPanel } from "./RubricPanel";
import { FeedbackPanel } from "./FeedbackPanel";
import { VoiceInput } from "./VoiceInput";

export interface InterviewStudioProps {
  question: Question;
  onBack: () => void;
  onSubmitAnswer: (userAnswer: string) => Promise<void>;
  isSubmitting: boolean;
  onShowModelAnswer: () => void;
  error?: string | null;
  // Optional enhancements for complete Studio experience
  report?: FeedbackReport | null;
  allQuestions?: QuestionSummary[];
  onSelectQuestion?: (id: string) => void;
  onNextQuestion?: () => void;
  onClearFeedback?: () => void;
}

type CoachTab = "feedback" | "vocabulary" | "star" | "rubric";

export function InterviewStudio({
  question,
  onBack,
  onSubmitAnswer,
  isSubmitting,
  onShowModelAnswer,
  error,
  report = null,
  allQuestions = [],
  onSelectQuestion,
  onNextQuestion,
  onClearFeedback,
}: InterviewStudioProps) {
  const { t } = useLanguage();
  const [answer, setAnswer] = useState<string>("");
  const [activeCoachTab, setActiveCoachTab] = useState<CoachTab>(
    report ? "feedback" : "vocabulary"
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"editor" | "coach">("editor");
  const [evaluatedIds, setEvaluatedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto switch coach tab when a report arrives
  useEffect(() => {
    if (report) {
      setActiveCoachTab("feedback");
      setEvaluatedIds((prev) => new Set([...prev, question.id]));
    }
  }, [report, question.id]);

  // Show transient toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Text length metrics
  const charCount = answer.length;
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const isTooShort = answer.trim().length < 10;
  const isTooLong = charCount > 4000;
  const canSubmit = !isTooShort && !isTooLong && !isSubmitting;

  // Insert helper text at cursor or at end
  const handleInsertText = useCallback(
    (textToInsert: string) => {
      setAnswer((prev) => {
        if (!prev) return textToInsert;
        return prev + "\n\n" + textToInsert;
      });
      showToast("Inserted into answer draft");
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    },
    [showToast]
  );

  // Quick insertion helpers
  const handleInsertSTAR = useCallback(() => {
    const starTemplate =
      "Situation: When operating our production environment, we experienced...\nTask: My primary objective was to diagnose the root cause and restore customer traffic within SLA.\nAction: I investigated the issue by inspecting events and executing diagnostic commands...\nResult: As a result, the recovery completed in minutes with zero customer-facing data loss.";
    handleInsertText(starTemplate);
  }, [handleInsertText]);

  const handleInsertTroubleshooting = useCallback(() => {
    const tsTemplate =
      "When diagnosing this issue in production, I take a structured chronological approach. First, I verify container and node events. Next, I inspect previous termination logs. Finally, I apply the targeted mitigation via our deployment manifest.";
    handleInsertText(tsTemplate);
  }, [handleInsertText]);

  const handleClearDraft = () => {
    if (answer && window.confirm("Clear your current answer draft?")) {
      setAnswer("");
      showToast(t.studio.clearedDraftToast);
    }
  };

  // Submit handling
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    await onSubmitAnswer(answer);
  }, [canSubmit, onSubmitAnswer, answer]);

  // Keyboard shortcut: Ctrl + Enter / Cmd + Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (canSubmit) {
        handleSubmit();
      }
    }
  };

  // Next question availability
  const currentQIndex = allQuestions.findIndex((q) => q.id === question.id);
  const hasNextQ = currentQIndex >= 0 && currentQIndex < allQuestions.length - 1;

  const handleNext = () => {
    if (hasNextQ && onSelectQuestion) {
      const nextQ = allQuestions[currentQIndex + 1];
      setAnswer("");
      if (onClearFeedback) onClearFeedback();
      onSelectQuestion(nextQ.id);
    } else if (onNextQuestion) {
      onNextQuestion();
    }
  };

  const handleRefine = () => {
    setActiveCoachTab("vocabulary");
    setMobileTab("editor");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleRetry = () => {
    setAnswer("");
    if (onClearFeedback) onClearFeedback();
    setActiveCoachTab("vocabulary");
    setMobileTab("editor");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-3.5 min-h-0 overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-brand-500/50 text-white text-xs font-semibold shadow-2xl shadow-brand-500/20 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {toastMessage}
        </div>
      )}

      {/* ZONE 1 (LEFT): Session Navigation (Collapsible on Desktop) */}
      {allQuestions.length > 0 && onSelectQuestion && (
        <div className="hidden lg:block shrink-0 h-full min-h-0">
          <SessionSidebar
            questions={allQuestions}
            currentQuestionId={question.id}
            evaluatedQuestionIds={evaluatedIds}
            onSelectQuestion={(id) => {
              if (id !== question.id) {
                setAnswer("");
                if (onClearFeedback) onClearFeedback();
                onSelectQuestion(id);
              }
            }}
            onBackToCatalog={onBack}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>
      )}

      {/* ZONE 2 (CENTER): Main Interview Experience */}
      <div
        className={`flex-1 flex flex-col space-y-2.5 min-w-0 h-full min-h-0 overflow-hidden ${
          mobileTab === "coach" ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Top Session Bar */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-950 border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onBack}
              className="lg:hidden px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white"
            >
              {t.practice.backBtn}
            </button>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 uppercase tracking-wider">
              {question.role.replace("_", " ")}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-semibold text-xs capitalize">
              {question.topic.replace("_", " ")}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium capitalize">
              {question.difficulty} {t.practice.levelSuffix}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.studio.targetTime}</span>
          </div>
        </div>

        {/* Question Prompt Card */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md space-y-2 relative overflow-hidden shrink-0 max-h-36 sm:max-h-40 overflow-y-auto studio-custom-scrollbar">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
              {t.practice.studioBadge}
            </span>
            {question.rubric.star_method_applicable && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {t.studio.starBuilder.recommendedBadge}
              </span>
            )}
          </div>

          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
            {question.title}
          </h1>

          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-950/90 border border-slate-800/80 text-slate-100 text-xs sm:text-[13px] leading-relaxed font-sans">
            &ldquo;{question.prompt}&rdquo;
          </div>

          {/* Competencies Badges */}
          {question.competencies && question.competencies.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-slate-400 mr-1 flex items-center">
                <Layers className="w-3 h-3 mr-1 text-brand-400" />
                Focus:
              </span>
              {question.competencies.map((comp, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950 text-slate-300 border border-slate-800"
                >
                  {comp}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Answer Editor Workspace */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2 flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-400" />
                {t.practice.answerLabel}
              </h2>
              <p className="text-[11px] text-slate-400">
                Articulate clearly in English as if on an interview video call.
              </p>
            </div>

            {/* Quick Helper Chips & Voice Recorder */}
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              <VoiceInput
                onTranscript={(spokenText) => handleInsertText(spokenText)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleInsertSTAR}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                {t.practice.starChip}
              </button>
              <button
                type="button"
                onClick={handleInsertTroubleshooting}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                {t.practice.troubleshootingChip}
              </button>
              {answer && (
                <button
                  type="button"
                  onClick={handleClearDraft}
                  title={t.studio.clearDraft}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Text Area with internal vertical scroll */}
          <div className="relative flex-1 min-h-0 flex flex-col">
            <textarea
              ref={textareaRef}
              placeholder={t.practice.placeholder}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              aria-label={t.practice.answerLabel}
              className="w-full h-full p-3.5 pb-8 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-sans leading-relaxed resize-none overflow-y-auto studio-custom-scrollbar"
            />

            {/* Character & Word Counter */}
            <div className="absolute right-3 bottom-2 flex items-center space-x-2.5 text-[10px] bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800/80 backdrop-blur-sm pointer-events-none z-10">
              <span className="text-slate-400">
                {wordCount} {t.practice.wordCounter}
              </span>
              <span
                className={`font-mono font-semibold ${
                  charCount > 4000
                    ? "text-rose-400"
                    : charCount >= 10
                    ? "text-emerald-400"
                    : "text-slate-500"
                }`}
              >
                {charCount} / 4000
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="flex items-center space-x-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 shrink-0"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1 shrink-0">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onShowModelAnswer}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-950 text-slate-300 hover:text-white text-xs font-semibold transition-all inline-flex items-center justify-center cursor-pointer"
              >
                <Eye className="w-4 h-4 mr-1.5 text-slate-400" />
                {t.practice.studyModelBtn}
              </button>
              <span className="hidden xl:inline-flex items-center text-[10px] text-slate-500">
                <Command className="w-3 h-3 mr-1" />
                {t.studio.shortcutHint}
              </span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center shadow-lg ${
                  canSubmit
                    ? "bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-brand-600/30 cursor-pointer"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    {t.practice.submittingBtn}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {t.practice.submitBtn}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ZONE 3 (RIGHT): Contextual Coaching Panel */}
      <div
        className={`w-full lg:w-80 xl:w-96 2xl:w-[410px] shrink-0 h-full min-h-0 flex flex-col space-y-2.5 overflow-hidden ${
          mobileTab === "editor" ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Coach Tabs Navigation */}
        <div className="p-1 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-1 shrink-0 overflow-x-auto">
          {report && (
            <button
              type="button"
              onClick={() => setActiveCoachTab("feedback")}
              className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                activeCoachTab === "feedback"
                  ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/20"
                  : "text-brand-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.studio.tabs.feedback}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveCoachTab("vocabulary")}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              activeCoachTab === "vocabulary"
                ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.studio.tabs.vocabulary}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCoachTab("star")}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              activeCoachTab === "star"
                ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.studio.tabs.starBuilder}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCoachTab("rubric")}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              activeCoachTab === "rubric"
                ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.studio.tabs.rubric}</span>
          </button>
        </div>

        {/* Coach Content Panel */}
        <div
          role="region"
          aria-label="Coaching resources panel"
          tabIndex={0}
          className="flex-1 min-h-0 p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-y-auto studio-custom-scrollbar focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500/50"
        >
          {activeCoachTab === "feedback" && report && (
            <FeedbackPanel
              report={report}
              question={question}
              onRefineAnswer={handleRefine}
              onRetry={handleRetry}
              onNextQuestion={handleNext}
              hasNextQuestion={hasNextQ}
              onSelectFollowup={(text) => handleInsertText(`Follow-up Consideration: ${text}`)}
            />
          )}

          {activeCoachTab === "vocabulary" && (
            <VocabularyCoach
              keyConcepts={question.rubric.key_concepts}
              competencies={question.competencies}
              onInsertTerm={(term) => handleInsertText(term)}
            />
          )}

          {activeCoachTab === "star" && (
            <STARBuilder
              isStarRecommended={question.rubric.star_method_applicable}
              onInsertSection={(sec) => handleInsertText(sec)}
              onInsertAll={handleInsertSTAR}
            />
          )}

          {activeCoachTab === "rubric" && (
            <RubricPanel
              criteria={question.rubric.evaluation_criteria}
              pitfalls={question.rubric.common_pitfalls}
            />
          )}
        </div>
      </div>

      {/* Mobile Bottom Tab Bar (Only visible on small screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 p-2 flex items-center justify-around">
        <button
          type="button"
          onClick={() => setMobileTab("editor")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${
            mobileTab === "editor"
              ? "bg-brand-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {t.studio.mobile.editorTab}
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("coach")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all flex items-center justify-center space-x-1 ${
            mobileTab === "coach"
              ? "bg-brand-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>{t.studio.mobile.coachingTab}</span>
          {report && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
        </button>
      </div>
    </div>
  );
}


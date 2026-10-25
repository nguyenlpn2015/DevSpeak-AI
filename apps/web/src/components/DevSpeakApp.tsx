"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { QuestionCatalog } from "@/components/QuestionCatalog";
import { QuestionDetailView } from "@/components/QuestionDetailView";
import { PracticeStudio } from "@/components/PracticeStudio";
import { FeedbackStudio } from "@/components/FeedbackStudio";
import { LinguaSidebar, NavItem } from "@/components/linguaflow/LinguaSidebar";
import { LinguaFlowDashboard } from "@/components/linguaflow/LinguaFlowDashboard";
import { FlashcardsView } from "@/components/linguaflow/FlashcardsView";
import { Question, QuestionSummary, FeedbackReport, ProgressSummary } from "@/types";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  checkBackendStatus,
  getQuestions,
  getQuestionById,
  submitEvaluation,
  createSession,
  submitSessionAttempt,
  getProgressSummary,
} from "@/lib/api";

type TabState =
  | "home"
  | "catalog"
  | "detail"
  | "practice"
  | "feedback"
  | "flashcards"
  | "star";

export function DevSpeakApp() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabState>("home");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuestionSummary[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [report, setReport] = useState<FeedbackReport | null>(null);
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Probe backend status
  const checkHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const status = await checkBackendStatus(1);
      setIsBackendLive(status.isOnline);
      return status.isOnline;
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  // Fetch real progress analytics
  const fetchProgress = useCallback(async () => {
    try {
      const summary = await getProgressSummary();
      setProgress(summary);
    } catch {
      // Backend unavailable or error
    }
  }, []);

  // Fetch question list from API
  const fetchQuestionsList = useCallback(
    async (filters?: { role?: string; topic?: string; difficulty?: string }) => {
      setLoadingQuestions(true);
      setCatalogError(null);
      try {
        const data = await getQuestions(filters);
        setQuestions(data.items);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Cannot connect to DevSpeak API backend. Ensure the service is running on port 8000.";
        setCatalogError(msg);
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    checkHealth();
    fetchQuestionsList();
    fetchProgress();
  }, [checkHealth, fetchQuestionsList, fetchProgress]);

  // Handle viewing question specifications & rubric (User Journey 3)
  const handleViewDetail = async (id: string) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const q = await getQuestionById(id);
      setSelectedQuestion(q);
      setActiveTab("detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : `Failed to load details for question ${id}.`;
      setDetailError(msg);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle selecting a question directly for Practice (User Journey 4)
  const handleStartPractice = async (idOrQuestion: string | Question) => {
    setSubmitError(null);
    setReport(null);
    setCurrentSessionId(null);

    if (typeof idOrQuestion === "string") {
      setDetailLoading(true);
      try {
        const q = await getQuestionById(idOrQuestion);
        setSelectedQuestion(q);
        setActiveTab("practice");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : `Failed to load question ${idOrQuestion}.`;
        setSubmitError(msg);
      } finally {
        setDetailLoading(false);
      }
    } else {
      setSelectedQuestion(idOrQuestion);
      setActiveTab("practice");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Submit response for evaluation (User Journey 4)
  const handleSubmitAnswer = async (userAnswer: string) => {
    if (!selectedQuestion) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let activeSessionId = currentSessionId;
      if (!activeSessionId) {
        try {
          const newSession = await createSession(selectedQuestion.id);
          activeSessionId = newSession.id;
          setCurrentSessionId(activeSessionId);
        } catch {
          activeSessionId = null;
        }
      }

      let result: FeedbackReport;
      if (activeSessionId) {
        try {
          const attempt = await submitSessionAttempt(activeSessionId, userAnswer);
          result = attempt.feedback;
        } catch {
          result = await submitEvaluation(selectedQuestion.id, userAnswer, activeSessionId);
        }
      } else {
        result = await submitEvaluation(selectedQuestion.id, userAnswer);
      }

      setReport(result);
      await fetchProgress();
      setActiveTab("practice");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to evaluate answer. Please verify backend connection and try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show model answer as reference in self-study mode
  const handleShowModelAnswer = () => {
    if (!selectedQuestion) return;
    setReport({
      question_id: selectedQuestion.id,
      scores: {
        grammar_score: 9,
        technical_score: 9,
        clarity_score: 9,
        overall_score: 9.0,
      },
      feedback: {
        grammar_feedback: [
          "Demonstrates native-level technical communication and active verbs.",
        ],
        technical_feedback: [
          "Addresses all primary key concepts and avoids speculative details.",
        ],
        clarity_structure_feedback: [
          "Follows an ideal chronological progression without redundant filler phrases.",
        ],
      },
      model_answer: selectedQuestion.sample_answer,
      suggested_followups: selectedQuestion.follow_up_questions.slice(0, 2),
      disclaimer:
        "Canonical benchmark model answer viewed in self-study reference mode (0-Cost Heuristic Mock).",
    });
    setActiveTab("practice");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetryPractice = () => {
    setReport(null);
    setSubmitError(null);
    setActiveTab("practice");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToCatalog = () => {
    setActiveTab("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Map current tab state to LinguaSidebar NavItem
  const mapTabToNav = (tab: TabState): NavItem => {
    switch (tab) {
      case "home":
        return "dashboard";
      case "catalog":
      case "detail":
        return "catalog";
      case "flashcards":
        return "flashcards";
      case "star":
        return "star";
      case "practice":
      case "feedback":
        return "practice";
      default:
        return "dashboard";
    }
  };

  // Handle navigation from LinguaSidebar
  const handleSidebarNavigate = (nav: NavItem) => {
    setMobileSidebarOpen(false);
    if (nav === "dashboard") {
      setActiveTab("home");
    } else if (nav === "catalog") {
      setActiveTab("catalog");
      fetchQuestionsList();
    } else if (nav === "flashcards" || nav === "vocab") {
      setActiveTab("flashcards");
    } else if (nav === "practice" || nav === "shadowing") {
      if (selectedQuestion) {
        setActiveTab("practice");
      } else if (questions.length > 0) {
        handleStartPractice(questions[0].id);
      } else {
        setActiveTab("catalog");
      }
    } else if (nav === "star") {
      const starQ = questions.find((q) => q.topic === "behavioral");
      if (starQ) {
        handleStartPractice(starQ.id);
      } else if (questions.length > 0) {
        handleStartPractice(questions[0].id);
      } else {
        setActiveTab("catalog");
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle actions triggered from LinguaFlowDashboard
  const handleFlowAction = (
    action: "flashcards" | "shadowing" | "studio" | "exercises"
  ) => {
    if (action === "flashcards") {
      setActiveTab("flashcards");
    } else if (action === "exercises") {
      setActiveTab("catalog");
    } else if (action === "studio" || action === "shadowing") {
      if (selectedQuestion) {
        setActiveTab("practice");
      } else if (questions.length > 0) {
        handleStartPractice(questions[0].id);
      } else {
        setActiveTab("catalog");
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle practice triggered directly from Flashcard Studio
  const handlePracticeFromFlashcard = (term: string) => {
    const match = questions.find((q) =>
      q.title.toLowerCase().includes(term.toLowerCase()) ||
      q.prompt.toLowerCase().includes(term.toLowerCase())
    );
    if (match) {
      handleStartPractice(match.id);
    } else if (questions.length > 0) {
      handleStartPractice(questions[0].id);
    } else {
      setActiveTab("catalog");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#05040F] text-[#F5F3FF]">
      {/* LinguaFlow Fixed Desktop Sidebar & Mobile Drawer */}
      <LinguaSidebar
        currentNav={mapTabToNav(activeTab)}
        onNavigate={handleSidebarNavigate}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        streakDays={progress?.streak_days ?? 1}
        totalXp={progress?.xp_earned ?? 50}
      />

      {/* Main Content Area: sits directly flush next to the sidebar with NO pl-64 */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-[#05040F] ${
          activeTab === "practice" ? "h-screen max-h-screen overflow-hidden" : "min-h-screen"
        }`}
      >
        {/* Top Navigation Header */}
        <Header
          isBackendLive={isBackendLive}
          isBackendChecking={isCheckingHealth}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          hasActiveQuestion={selectedQuestion !== null}
          onRefreshHealth={async () => {
            await checkHealth();
            fetchQuestionsList();
          }}
          onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {/* Viewport Content: Clean balanced container without orphan voids */}
        <main
          className={`w-full ${
            activeTab === "practice"
              ? "flex-1 min-h-0 overflow-hidden px-3 sm:px-4 xl:px-6 py-2.5"
              : "flex-1 px-4 sm:px-6 xl:px-8 pt-4 pb-6"
          }`}
        >
          {/* Journey 1: LinguaFlow Flagship Dashboard */}
          {activeTab === "home" && (
            <LinguaFlowDashboard
              onStartAction={handleFlowAction}
              dayStreak={progress?.streak_days ?? 1}
              totalXP={progress ? progress.xp_earned.toLocaleString() : "250"}
              wordsLearned={progress ? progress.total_attempts * 15 + 40 : 184}
              level={progress ? Math.floor(progress.xp_earned / 500) + 1 : 1}
            />
          )}

          {/* Flashcard Studio View */}
          {activeTab === "flashcards" && (
            <FlashcardsView
              onBack={() => setActiveTab("home")}
              onPracticeInStudio={handlePracticeFromFlashcard}
            />
          )}

          {/* Journey 2: Question Catalog */}
          {activeTab === "catalog" && (
            <QuestionCatalog
              questions={questions}
              loading={loadingQuestions}
              error={catalogError}
              selectedQuestionId={selectedQuestion?.id || null}
              onSelectQuestion={(id) => handleStartPractice(id)}
              onViewDetail={(id) => handleViewDetail(id)}
              onFilterChange={(filters) => fetchQuestionsList(filters)}
              onRetry={() => {
                checkHealth();
                fetchQuestionsList();
              }}
            />
          )}

          {/* Journey 3: Question Detail View */}
          {activeTab === "detail" && (
            <div>
              {detailLoading ? (
                <div className="text-center py-24 text-[#9286C7] animate-pulse">
                  {t.detail.loadingDetail}
                </div>
              ) : detailError ? (
                <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-center space-y-3">
                  <h3 className="text-base font-bold text-white">{t.detail.errorTitle}</h3>
                  <p className="text-xs text-rose-300">{detailError}</p>
                  <button
                    onClick={handleBackToCatalog}
                    className="px-4 py-2 rounded-xl bg-[#120C26] hover:bg-[#1F1538] text-xs font-semibold text-white cursor-pointer border border-[#1F1538]"
                  >
                    {t.detail.backBtn}
                  </button>
                </div>
              ) : selectedQuestion ? (
                <QuestionDetailView
                  question={selectedQuestion}
                  onBack={handleBackToCatalog}
                  onStartPractice={(q) => handleStartPractice(q)}
                />
              ) : null}
            </div>
          )}

          {/* Journey 4: Mock Interview Practice Studio */}
          {activeTab === "practice" && selectedQuestion && (
            <PracticeStudio
              question={selectedQuestion}
              onBack={handleBackToCatalog}
              onSubmitAnswer={handleSubmitAnswer}
              isSubmitting={isSubmitting}
              onShowModelAnswer={handleShowModelAnswer}
              error={submitError}
              report={report}
              allQuestions={questions}
              onSelectQuestion={(id) => handleStartPractice(id)}
              onClearFeedback={() => setReport(null)}
            />
          )}

          {/* Feedback Studio */}
          {activeTab === "feedback" && report && selectedQuestion && (
            <FeedbackStudio
              report={report}
              question={selectedQuestion}
              onRetry={handleRetryPractice}
              onBackToCatalog={handleBackToCatalog}
            />
          )}
        </main>

        {/* Sleek LinguaFlow Dark Footer (Hidden in immersive practice studio) */}
        {activeTab !== "practice" && (
          <footer className="border-t border-[#1F1538] bg-[#080613]/90 py-3.5 text-center text-xs text-[#6B5E99] mt-6">
            <div className="w-full px-4 sm:px-6 xl:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[#9286C7]">{t.footer.copyright}</p>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="text-[#9286C7]">{t.footer.securityFirst}</span>
                <span className="text-[#1F1538]">•</span>
                <span className="text-[#9286C7]">{t.footer.zeroCost}</span>
                <span className="text-[#1F1538]">•</span>
                <span className="text-[#9286C7]">{t.footer.localOffline}</span>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

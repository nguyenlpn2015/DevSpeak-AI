import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { QuestionCatalog } from "@/components/QuestionCatalog";
import { PracticeStudio } from "@/components/PracticeStudio";
import { Question, QuestionSummary, FeedbackReport } from "@/types";

const MOCK_QUESTION: Question = {
  id: "devops-k8s-001",
  title: "Triage CrashLoopBackOff",
  prompt: "Explain how you troubleshoot a CrashLoopBackOff container in production.",
  role: "devops",
  topic: "kubernetes",
  difficulty: "mid",
  competencies: ["Kubernetes", "Linux SRE"],
  rubric: {
    key_concepts: ["kubectl describe", "kubectl logs", "exit code 137"],
    star_method_applicable: true,
    evaluation_criteria: ["Explains triage order", "Mentions OOMKilled vs exit codes"],
    common_pitfalls: ["Restarting pod without checking logs"],
  },
  sample_answer: "My standard procedure starts by running kubectl describe pod to inspect the Last State...",
  follow_up_questions: ["What if the logs show no output at all?"],
};

const MOCK_SUMMARIES: QuestionSummary[] = [
  {
    id: "devops-k8s-001",
    title: "Triage CrashLoopBackOff",
    prompt: "Explain how you troubleshoot a CrashLoopBackOff container in production.",
    role: "devops",
    topic: "kubernetes",
    difficulty: "mid",
    competencies: ["Kubernetes", "Linux SRE"],
  },
  {
    id: "cloud-ha-002",
    title: "Multi-Region Active-Active Architecture",
    prompt: "How do you design a zero-downtime failover across cloud regions?",
    role: "cloud",
    topic: "aws",
    difficulty: "senior",
    competencies: ["GCP", "Global Load Balancing"],
  },
];

const MOCK_FEEDBACK: FeedbackReport = {
  question_id: "devops-k8s-001",
  scores: {
    overall_score: 8.5,
    technical_score: 9.0,
    grammar_score: 8.0,
    clarity_score: 8.5,
  },
  feedback: {
    technical_feedback: ["Clear explanation of kubectl describe and OOMKilled codes"],
    grammar_feedback: ["Grammatically clean sentences throughout"],
    clarity_structure_feedback: ["Solid DevOps vocabulary (probes, restartCount)"],
  },
  model_answer: "In a production incident, I immediately inspect the pod events...",
  suggested_followups: ["What if the logs show no output at all?"],
  disclaimer: "AI-generated feedback for learning purposes.",
};

function BilingualHeaderConsumer() {
  const { language, t } = useLanguage();
  return (
    <div>
      <span data-testid="active-lang">{language}</span>
      <span data-testid="nav-dashboard-label">{t.nav.dashboard}</span>
      <span data-testid="nav-questions-label">{t.nav.questionBank}</span>
      <LanguageSwitcher />
    </div>
  );
}

describe("End-to-End Bilingual User Journeys (English & Vietnamese)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Journey 1: Header Navigation & Language Switcher", () => {
    it("renders navigation in English by default and toggles to Vietnamese", () => {
      render(
        <LanguageProvider>
          <AuthProvider>
            <BilingualHeaderConsumer />
          </AuthProvider>
        </LanguageProvider>
      );

      // Default English
      expect(screen.getByTestId("active-lang").textContent).toBe("en");
      expect(screen.getByTestId("nav-dashboard-label").textContent).toBe("Dashboard");
      expect(screen.getByTestId("nav-questions-label").textContent).toBe("Question Bank");

      // Switch to Vietnamese
      const viButton = screen.getByTestId("lang-switch-vi");
      fireEvent.click(viButton);

      // Vietnamese texts
      expect(screen.getByTestId("active-lang").textContent).toBe("vi");
      expect(screen.getByTestId("nav-dashboard-label").textContent).toBe("Tổng quan");
      expect(screen.getByTestId("nav-questions-label").textContent).toBe("Ngân hàng câu hỏi");
      expect(localStorage.getItem("devspeak_locale")).toBe("vi");
    });

    it("persists language selection across reloads", () => {
      localStorage.setItem("devspeak_locale", "vi");

      render(
        <LanguageProvider>
          <AuthProvider>
            <BilingualHeaderConsumer />
          </AuthProvider>
        </LanguageProvider>
      );

      expect(screen.getByTestId("active-lang").textContent).toBe("vi");
      expect(screen.getByTestId("nav-dashboard-label").textContent).toBe("Tổng quan");
    });
  });

  describe("Journey 2: Question Catalog Browsing & Filtering", () => {
    it("renders catalog in English with category pills and questions", () => {
      render(
        <LanguageProvider>
          <QuestionCatalog
            questions={MOCK_SUMMARIES}
            loading={false}
            selectedQuestionId="devops-k8s-001"
            onSelectQuestion={vi.fn()}
            onViewDetail={vi.fn()}
            onFilterChange={vi.fn()}
            onRetry={vi.fn()}
          />
        </LanguageProvider>
      );

      expect(screen.getByText("Triage CrashLoopBackOff")).toBeDefined();
      expect(screen.getByText("Multi-Region Active-Active Architecture")).toBeDefined();
    });

    it("renders empty state correctly when no questions match filter", () => {
      render(
        <LanguageProvider>
          <QuestionCatalog
            questions={[]}
            loading={false}
            selectedQuestionId={null}
            onSelectQuestion={vi.fn()}
            onViewDetail={vi.fn()}
            onFilterChange={vi.fn()}
            onRetry={vi.fn()}
          />
        </LanguageProvider>
      );

      expect(screen.getByText(/No questions match your filter/i)).toBeDefined();
    });
  });

  describe("Journey 3: Practice Studio & Evaluation Flow", () => {
    it("renders practice prompt, allows entering response and submits", async () => {
      const mockSubmit = vi.fn().mockResolvedValue(undefined);

      render(
        <LanguageProvider>
          <PracticeStudio
            question={MOCK_QUESTION}
            onBack={vi.fn()}
            onSubmitAnswer={mockSubmit}
            isSubmitting={false}
            onShowModelAnswer={vi.fn()}
            allQuestions={MOCK_SUMMARIES}
          />
        </LanguageProvider>
      );

      expect(screen.getByText(MOCK_QUESTION.title)).toBeDefined();
      expect(screen.getByText(/Explain how you troubleshoot/i)).toBeDefined();

      // Find answer textarea and enter candidate explanation
      const textarea = screen.getByPlaceholderText(/Start speaking or typing your answer/i);
      fireEvent.change(textarea, {
        target: {
          value:
            "First, I run kubectl describe pod to inspect the termination state and exit code. If exit code is 137, the container was OOMKilled.",
        },
      });

      // Submit answer button
      const submitBtn = screen.getByRole("button", { name: /Submit for AI Coaching/i });
      fireEvent.click(submitBtn);

      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    it("renders AI evaluation feedback report with scoring breakdown", () => {
      render(
        <LanguageProvider>
          <PracticeStudio
            question={MOCK_QUESTION}
            onBack={vi.fn()}
            onSubmitAnswer={vi.fn()}
            isSubmitting={false}
            onShowModelAnswer={vi.fn()}
            report={MOCK_FEEDBACK}
            allQuestions={MOCK_SUMMARIES}
          />
        </LanguageProvider>
      );

      // Verify report contents
      expect(screen.getByText(/Clear explanation of kubectl describe/i)).toBeDefined();
      expect(screen.getByText("8.5")).toBeDefined();
    });
  });
});

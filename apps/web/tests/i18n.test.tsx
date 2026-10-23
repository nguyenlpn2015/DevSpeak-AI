import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "@/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Header } from "@/components/Header";
import { QuestionDetailView } from "@/components/QuestionDetailView";
import { Question } from "@/types";
import { en } from "@/i18n/en";
import { vi as viDict } from "@/i18n/vi";

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

function TestConsumer() {
  const { language, t } = useLanguage();
  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <span data-testid="nav-dashboard">{t.nav.dashboard}</span>
      <span data-testid="nav-question-bank">{t.nav.questionBank}</span>
      <span data-testid="footer-zero-cost">{t.footer.zeroCost}</span>
      <LanguageSwitcher />
    </div>
  );
}

describe("i18n Subsystem & Language Switching", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Dictionary Key Parity", () => {
    function getDeepKeys(obj: Record<string, unknown>, prefix = ""): string[] {
      return Object.keys(obj).reduce((res: string[], el: string) => {
        const val = obj[el];
        if (typeof val === "object" && val !== null && !Array.isArray(val)) {
          return [...res, ...getDeepKeys(val as Record<string, unknown>, prefix + el + ".")];
        }
        return [...res, prefix + el];
      }, []);
    }

    it("ensures English and Vietnamese dictionaries have identical key structure", () => {
      const enKeys = getDeepKeys(en as unknown as Record<string, unknown>).sort();
      const viKeys = getDeepKeys(viDict as unknown as Record<string, unknown>).sort();

      expect(viKeys).toEqual(enKeys);
      expect(enKeys.length).toBeGreaterThan(40);
    });

    it("verifies no empty string values exist in translation dictionaries", () => {
      const validateNonEmpty = (obj: Record<string, unknown>, dictName: string) => {
        for (const [key, val] of Object.entries(obj)) {
          if (typeof val === "string") {
            expect(val.trim().length, `Empty string at ${dictName}.${key}`).toBeGreaterThan(0);
          } else if (typeof val === "object" && val !== null) {
            validateNonEmpty(val as Record<string, unknown>, `${dictName}.${key}`);
          }
        }
      };

      validateNonEmpty(en as unknown as Record<string, unknown>, "en");
      validateNonEmpty(viDict as unknown as Record<string, unknown>, "vi");
    });
  });

  describe("LanguageContext & Switching Behavior", () => {
    it("defaults to English when no preference is saved in localStorage", () => {
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );

      expect(screen.getByTestId("current-lang").textContent).toBe("en");
      expect(screen.getByTestId("nav-dashboard").textContent).toBe("Dashboard");
      expect(screen.getByTestId("nav-question-bank").textContent).toBe("Question Bank");
      expect(screen.getByTestId("footer-zero-cost").textContent).toBe("0-Cost Heuristic Evaluation");
    });

    it("switches to Vietnamese when clicking the VI toggle button", () => {
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );

      const viButton = screen.getByTestId("lang-switch-vi");
      fireEvent.click(viButton);

      expect(screen.getByTestId("current-lang").textContent).toBe("vi");
      expect(screen.getByTestId("nav-dashboard").textContent).toBe("Tổng quan");
      expect(screen.getByTestId("nav-question-bank").textContent).toBe("Ngân hàng câu hỏi");
      expect(screen.getByTestId("footer-zero-cost").textContent).toBe("Đánh giá Heuristic chi phí 0đ");
      expect(localStorage.getItem("devspeak_locale")).toBe("vi");
    });

    it("switches back to English when clicking the EN toggle button", () => {
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );

      // Switch to VI then back to EN
      fireEvent.click(screen.getByTestId("lang-switch-vi"));
      expect(screen.getByTestId("current-lang").textContent).toBe("vi");

      fireEvent.click(screen.getByTestId("lang-switch-en"));
      expect(screen.getByTestId("current-lang").textContent).toBe("en");
      expect(screen.getByTestId("nav-dashboard").textContent).toBe("Dashboard");
      expect(localStorage.getItem("devspeak_locale")).toBe("en");
    });

    it("hydrates language preference from localStorage on mount", async () => {
      localStorage.setItem("devspeak_locale", "vi");

      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("current-lang").textContent).toBe("vi");
      });
      expect(screen.getByTestId("nav-dashboard").textContent).toBe("Tổng quan");
    });

    it("falls back safely to English when localStorage contains invalid data", async () => {
      localStorage.setItem("devspeak_locale", "fr_invalid");

      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );

      expect(screen.getByTestId("current-lang").textContent).toBe("en");
      expect(screen.getByTestId("nav-dashboard").textContent).toBe("Dashboard");
    });
  });

  describe("Header Component i18n Integration", () => {
    it("renders Header labels in Vietnamese when switched", () => {
      render(
        <LanguageProvider>
          <Header
            isBackendLive={true}
            activeTab="home"
            onTabChange={vi.fn()}
            hasActiveQuestion={false}
          />
        </LanguageProvider>
      );

      expect(screen.getByText("Dashboard")).toBeDefined();
      expect(screen.getByText("Question Bank")).toBeDefined();
      expect(screen.getByText("Practice Studio")).toBeDefined();

      // Switch to Vietnamese
      fireEvent.click(screen.getByTestId("lang-switch-vi"));

      expect(screen.getByText("Tổng quan")).toBeDefined();
      expect(screen.getByText("Ngân hàng câu hỏi")).toBeDefined();
      expect(screen.getByText("Phòng luyện tập")).toBeDefined();
      expect(screen.getByText("Đã kết nối FastAPI")).toBeDefined();
      expect(screen.getByText("Heuristic 0-Cost")).toBeDefined();
    });
  });

  describe("Interview Learning Integrity (Technical English Preservation)", () => {
    it("preserves technical question prompts, rubrics, and sample answers in English when UI is in Vietnamese", () => {
      render(
        <LanguageProvider>
          <TestConsumer />
          <QuestionDetailView
            question={MOCK_QUESTION}
            onBack={vi.fn()}
            onStartPractice={vi.fn()}
          />
        </LanguageProvider>
      );

      // Switch UI to Vietnamese
      fireEvent.click(screen.getByTestId("lang-switch-vi"));

      // UI Labels should be Vietnamese
      expect(screen.getByText("Thông số kỹ thuật câu hỏi phỏng vấn")).toBeDefined();
      expect(screen.getByText("Khuyến khích cấu trúc theo STAR")).toBeDefined();
      expect(screen.getByText("Thời lượng mục tiêu: 60–90 giây")).toBeDefined();
      expect(screen.getByText("Bắt đầu phỏng vấn thử")).toBeDefined();
      expect(screen.getByText("Quay lại Ngân hàng câu hỏi")).toBeDefined();

      // CRITICAL INTEGRITY CHECK: Technical English content MUST remain untouched!
      expect(screen.getByText("Triage CrashLoopBackOff")).toBeDefined();
      expect(screen.getByText(/Explain how you troubleshoot a CrashLoopBackOff container in production\./i)).toBeDefined();
      expect(screen.getByText("kubectl describe")).toBeDefined();
      expect(screen.getByText("exit code 137")).toBeDefined();
      expect(screen.getByText(/My standard procedure starts by running kubectl describe pod/i)).toBeDefined();
      expect(screen.getByText(/What if the logs show no output at all\?/i)).toBeDefined();
    });
  });
});


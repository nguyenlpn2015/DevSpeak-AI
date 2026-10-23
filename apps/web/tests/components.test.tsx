import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestionCatalog } from "@/components/QuestionCatalog";
import { PracticeStudio } from "@/components/PracticeStudio";
import { QuestionDetailView } from "@/components/QuestionDetailView";
import { Question, QuestionSummary } from "@/types";

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
    star_method_applicable: false,
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
    id: "devops-cicd-002",
    title: "Canary Rollback Strategy",
    prompt: "How do you design an automated rollback strategy for canary releases?",
    role: "devops",
    topic: "cicd",
    difficulty: "senior",
    competencies: ["CI/CD", "SLO Monitoring"],
  },
];

describe("QuestionCatalog Component", () => {
  it("renders loading skeletons when loading is true", () => {
    const { container } = render(
      <QuestionCatalog
        questions={[]}
        loading={true}
        selectedQuestionId={null}
        onSelectQuestion={vi.fn()}
        onViewDetail={vi.fn()}
        onFilterChange={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    const skeletonCards = container.querySelectorAll(".animate-pulse");
    expect(skeletonCards.length).toBeGreaterThan(0);
  });

  it("renders error state with retry button when error prop is present", () => {
    const onRetry = vi.fn();
    render(
      <QuestionCatalog
        questions={[]}
        loading={false}
        error="Cannot connect to DevSpeak API at http://127.0.0.1:8000."
        selectedQuestionId={null}
        onSelectQuestion={vi.fn()}
        onViewDetail={vi.fn()}
        onFilterChange={vi.fn()}
        onRetry={onRetry}
      />
    );

    expect(screen.getByText(/Backend Connection Error/i)).toBeDefined();
    expect(screen.getByText(/Cannot connect to DevSpeak API/i)).toBeDefined();

    const retryButton = screen.getByRole("button", { name: /Retry Backend Connection/i });
    expect(retryButton).toBeDefined();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders empty state with reset filters button when questions list is empty", () => {
    const onFilterChange = vi.fn();
    render(
      <QuestionCatalog
        questions={[]}
        loading={false}
        selectedQuestionId={null}
        onSelectQuestion={vi.fn()}
        onViewDetail={vi.fn()}
        onFilterChange={onFilterChange}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText(/No questions match your filter criteria/i)).toBeDefined();
    const resetBtn = screen.getByRole("button", { name: /Reset All Filters/i });
    fireEvent.click(resetBtn);
    expect(onFilterChange).toHaveBeenCalledWith({ role: "all", topic: "all", difficulty: "all" });
  });

  it("renders question cards and triggers callbacks on click", () => {
    const onSelect = vi.fn();
    const onViewDetail = vi.fn();

    render(
      <QuestionCatalog
        questions={MOCK_SUMMARIES}
        loading={false}
        selectedQuestionId={null}
        onSelectQuestion={onSelect}
        onViewDetail={onViewDetail}
        onFilterChange={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText("Triage CrashLoopBackOff")).toBeDefined();
    expect(screen.getByText("Canary Rollback Strategy")).toBeDefined();

    // Click Rubric & Details
    const detailButtons = screen.getAllByRole("button", { name: /Rubric & Details/i });
    fireEvent.click(detailButtons[0]);
    expect(onViewDetail).toHaveBeenCalledWith("devops-k8s-001");

    // Click Start Practice
    const practiceButtons = screen.getAllByRole("button", { name: /Start Practice/i });
    fireEvent.click(practiceButtons[0]);
    expect(onSelect).toHaveBeenCalledWith("devops-k8s-001");
  });
});

describe("PracticeStudio Component", () => {
  it("disables submit button when answer is shorter than 10 characters", () => {
    render(
      <PracticeStudio
        question={MOCK_QUESTION}
        onBack={vi.fn()}
        onSubmitAnswer={vi.fn()}
        isSubmitting={false}
        onShowModelAnswer={vi.fn()}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /Submit for AI Coaching & Score/i });
    expect(submitBtn).toBeDefined();
    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it("enables submit button when valid answer is typed, and submits on click", () => {
    const onSubmit = vi.fn();
    render(
      <PracticeStudio
        question={MOCK_QUESTION}
        onBack={vi.fn()}
        onSubmitAnswer={onSubmit}
        isSubmitting={false}
        onShowModelAnswer={vi.fn()}
      />
    );

    const textarea = screen.getByPlaceholderText(/Start speaking or typing your answer in English/i);
    fireEvent.change(textarea, {
      target: {
        value: "First, I inspect the pod status with kubectl describe pod to check for OOMKilled.",
      },
    });

    const submitBtn = screen.getByRole("button", { name: /Submit for AI Coaching & Score/i });
    expect((submitBtn as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      "First, I inspect the pod status with kubectl describe pod to check for OOMKilled."
    );
  });

  it("prevents duplicate submissions when isSubmitting is true", () => {
    render(
      <PracticeStudio
        question={MOCK_QUESTION}
        onBack={vi.fn()}
        onSubmitAnswer={vi.fn()}
        isSubmitting={true}
        onShowModelAnswer={vi.fn()}
      />
    );

    expect(screen.getByText(/Evaluating Response\.\.\./i)).toBeDefined();
    const btn = screen.getByRole("button", { name: /Evaluating Response\.\.\./i });
    expect((btn as HTMLButtonElement).disabled).toBe(true);

    const textarea = screen.getByPlaceholderText(/Start speaking or typing your answer in English/i);
    expect((textarea as HTMLTextAreaElement).disabled).toBe(true);
  });

  it("inserts STAR template into textarea on clicking helper chip", () => {
    render(
      <PracticeStudio
        question={MOCK_QUESTION}
        onBack={vi.fn()}
        onSubmitAnswer={vi.fn()}
        isSubmitting={false}
        onShowModelAnswer={vi.fn()}
      />
    );

    const starBtn = screen.getByRole("button", { name: /\+ STAR Framework/i });
    fireEvent.click(starBtn);

    const textarea = screen.getByPlaceholderText(/Start speaking or typing your answer in English/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain("Situation:");
    expect(textarea.value).toContain("Task:");
    expect(textarea.value).toContain("Action:");
    expect(textarea.value).toContain("Result:");
  });
});

describe("QuestionDetailView Component", () => {
  it("renders question specifications, rubric, sample answer, and follow-ups safely as text", () => {
    const onStartPractice = vi.fn();
    const onBack = vi.fn();

    render(
      <QuestionDetailView
        question={MOCK_QUESTION}
        onBack={onBack}
        onStartPractice={onStartPractice}
      />
    );

    expect(screen.getByText("Triage CrashLoopBackOff")).toBeDefined();
    expect(screen.getByText(/Explain how you troubleshoot a CrashLoopBackOff/i)).toBeDefined();
    expect(screen.getByText("kubectl describe")).toBeDefined();
    expect(screen.getByText(/Explains triage order/i)).toBeDefined();
    expect(screen.getByText(/Restarting pod without checking logs/i)).toBeDefined();
    expect(screen.getByText(/My standard procedure starts by running kubectl describe pod/i)).toBeDefined();
    expect(screen.getByText(/What if the logs show no output at all\?/i)).toBeDefined();

    const startBtn = screen.getByRole("button", { name: /Start Mock Interview/i });
    fireEvent.click(startBtn);
    expect(onStartPractice).toHaveBeenCalledWith(MOCK_QUESTION);

    const backBtn = screen.getByRole("button", { name: /Back to Question Bank/i });
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});


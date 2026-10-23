import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InterviewStudio } from "@/components/studio/InterviewStudio";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Question, QuestionSummary, FeedbackReport } from "@/types";

const MOCK_QUESTION: Question = {
  id: "k8s-pod-crashloopbackoff",
  title: "Troubleshooting Kubernetes CrashLoopBackOff",
  prompt: "A microservice pod is stuck in CrashLoopBackOff. How do you troubleshoot it?",
  role: "devops",
  topic: "kubernetes",
  difficulty: "mid",
  competencies: ["Kubernetes Core Architecture", "Container Lifecycle"],
  rubric: {
    key_concepts: [
      "kubectl describe pod",
      "kubectl logs --previous",
      "OOMKilled (Exit Code 137)",
      "liveness probe",
    ],
    star_method_applicable: true,
    evaluation_criteria: [
      "Systematic troubleshooting order",
      "Identifies OOM vs runtime errors",
    ],
    common_pitfalls: [
      "Deleting pod without inspecting previous logs",
    ],
  },
  sample_answer: "When troubleshooting a CrashLoopBackOff pod, I first run kubectl describe pod...",
  follow_up_questions: [
    "If the issue was a database timeout, how would you tune probe delays?",
  ],
};

const MOCK_ALL_QUESTIONS: QuestionSummary[] = [
  {
    id: "k8s-pod-crashloopbackoff",
    title: "Troubleshooting Kubernetes CrashLoopBackOff",
    prompt: "A microservice pod is stuck in CrashLoopBackOff.",
    role: "devops",
    topic: "kubernetes",
    difficulty: "mid",
    competencies: ["Kubernetes", "SRE"],
  },
  {
    id: "cicd-canary-rollback",
    title: "Automated Canary Release",
    prompt: "How do you detect canary failure and roll back?",
    role: "devops",
    topic: "cicd",
    difficulty: "senior",
    competencies: ["CI/CD"],
  },
];

const MOCK_FEEDBACK_REPORT: FeedbackReport = {
  question_id: "k8s-pod-crashloopbackoff",
  scores: {
    grammar_score: 8,
    technical_score: 9,
    clarity_score: 8,
    overall_score: 8.3,
  },
  feedback: {
    grammar_feedback: ["Demonstrates strong professional technical articulation."],
    technical_feedback: ["Successfully addressed kubectl describe pod and exit code 137."],
    clarity_structure_feedback: ["Structured response logically with chronological steps."],
  },
  model_answer: "When diagnosing a CrashLoopBackOff pod in production...",
  suggested_followups: ["How would you configure pod anti-affinity?"],
  disclaimer: "Deterministic heuristic feedback generated for practice.",
};

describe("InterviewStudio Flagship Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders 3-zone layout with question prompt and competencies", () => {
    render(
      <LanguageProvider>
        <InterviewStudio
          question={MOCK_QUESTION}
          allQuestions={MOCK_ALL_QUESTIONS}
          onBack={vi.fn()}
          onSubmitAnswer={vi.fn()}
          isSubmitting={false}
          onShowModelAnswer={vi.fn()}
          onSelectQuestion={vi.fn()}
        />
      </LanguageProvider>
    );

    // Question title & prompt
    expect(screen.getByRole("heading", { level: 1, name: /Troubleshooting Kubernetes CrashLoopBackOff/i })).toBeDefined();
    expect(screen.getByText(/A microservice pod is stuck in CrashLoopBackOff/i)).toBeDefined();

    // Focus competencies
    expect(screen.getAllByText("Kubernetes Core Architecture").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Container Lifecycle").length).toBeGreaterThanOrEqual(1);

    // Word and character counters
    expect(screen.getByText(/0 \/ 4000/i)).toBeDefined();
    expect(screen.getByText(/0 words/i)).toBeDefined();
  });

  it("switches questions when clicking on session sidebar item", () => {
    const onSelectQuestion = vi.fn();
    render(
      <LanguageProvider>
        <InterviewStudio
          question={MOCK_QUESTION}
          allQuestions={MOCK_ALL_QUESTIONS}
          onBack={vi.fn()}
          onSubmitAnswer={vi.fn()}
          isSubmitting={false}
          onShowModelAnswer={vi.fn()}
          onSelectQuestion={onSelectQuestion}
        />
      </LanguageProvider>
    );

    const secondQuestionBtn = screen.getByRole("button", { name: /Automated Canary Release/i });
    fireEvent.click(secondQuestionBtn);

    expect(onSelectQuestion).toHaveBeenCalledTimes(1);
    expect(onSelectQuestion).toHaveBeenCalledWith("cicd-canary-rollback");
  });

  it("collapses and expands the session navigation sidebar", () => {
    render(
      <LanguageProvider>
        <InterviewStudio
          question={MOCK_QUESTION}
          allQuestions={MOCK_ALL_QUESTIONS}
          onBack={vi.fn()}
          onSubmitAnswer={vi.fn()}
          isSubmitting={false}
          onShowModelAnswer={vi.fn()}
          onSelectQuestion={vi.fn()}
        />
      </LanguageProvider>
    );

    const collapseBtn = screen.getByRole("button", { name: /Collapse Sidebar/i });
    expect(collapseBtn).toBeDefined();

    fireEvent.click(collapseBtn);
    expect(screen.getByRole("button", { name: /Expand Sidebar/i })).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /Expand Sidebar/i }));
    expect(screen.getByRole("button", { name: /Collapse Sidebar/i })).toBeDefined();
  });

  it("allows switching coaching tabs and inserting vocabulary into answer", () => {
    render(
      <LanguageProvider>
        <InterviewStudio
          question={MOCK_QUESTION}
          allQuestions={MOCK_ALL_QUESTIONS}
          onBack={vi.fn()}
          onSubmitAnswer={vi.fn()}
          isSubmitting={false}
          onShowModelAnswer={vi.fn()}
          onSelectQuestion={vi.fn()}
        />
      </LanguageProvider>
    );

    // Switch to Vocabulary tab
    const vocabTab = screen.getByRole("button", { name: /Key Vocabulary/i });
    fireEvent.click(vocabTab);

    // Expect vocabulary terms from rubric to be displayed
    expect(screen.getByText("kubectl describe pod")).toBeDefined();
    expect(screen.getByText("OOMKilled (Exit Code 137)")).toBeDefined();

    // Click "Insert into Answer" on first term
    const insertButtons = screen.getAllByRole("button", { name: /Insert into Answer/i });
    expect(insertButtons.length).toBeGreaterThan(0);
    fireEvent.click(insertButtons[0]);

    const textarea = screen.getByPlaceholderText(/Start speaking or typing your answer in English/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain("kubectl describe pod");
  });

  it("renders STAR Builder and inserts full STAR framework", () => {
    render(
      <LanguageProvider>
        <InterviewStudio
          question={MOCK_QUESTION}
          allQuestions={MOCK_ALL_QUESTIONS}
          onBack={vi.fn()}
          onSubmitAnswer={vi.fn()}
          isSubmitting={false}
          onShowModelAnswer={vi.fn()}
          onSelectQuestion={vi.fn()}
        />
      </LanguageProvider>
    );

    // Switch to STAR tab
    const starTab = screen.getByRole("button", { name: /STAR Builder/i });
    fireEvent.click(starTab);

    expect(screen.getAllByText(/STAR Recommended/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/S — Situation/i)).toBeDefined();
    expect(screen.getByText(/T — Task/i)).toBeDefined();
    expect(screen.getByText(/A — Action/i)).toBeDefined();
    expect(screen.getByText(/R — Result/i)).toBeDefined();

    // Click "Insert Complete STAR Template"
    const insertAllBtn = screen.getByRole("button", { name: /Insert Complete STAR Template/i });
    fireEvent.click(insertAllBtn);

    const textarea = screen.getByPlaceholderText(/Start speaking or typing your answer in English/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain("Situation:");
    expect(textarea.value).toContain("Task:");
    expect(textarea.value).toContain("Action:");
    expect(textarea.value).toContain("Result:");
  });

  it("submits answer with Ctrl+Enter keyboard shortcut when answer is valid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <LanguageProvider>
        <InterviewStudio
          question={MOCK_QUESTION}
          allQuestions={MOCK_ALL_QUESTIONS}
          onBack={vi.fn()}
          onSubmitAnswer={onSubmit}
          isSubmitting={false}
          onShowModelAnswer={vi.fn()}
          onSelectQuestion={vi.fn()}
        />
      </LanguageProvider>
    );

    const textarea = screen.getByPlaceholderText(/Start speaking or typing your answer in English/i);
    fireEvent.change(textarea, {
      target: {
        value: "First I run kubectl describe pod to inspect recent container termination events.",
      },
    });

    // Press Ctrl+Enter
    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      "First I run kubectl describe pod to inspect recent container termination events."
    );
  });

  it("renders AI Feedback Panel when report prop is present and supports refining answer", () => {
    render(
      <LanguageProvider>
        <InterviewStudio
          question={MOCK_QUESTION}
          allQuestions={MOCK_ALL_QUESTIONS}
          report={MOCK_FEEDBACK_REPORT}
          onBack={vi.fn()}
          onSubmitAnswer={vi.fn()}
          isSubmitting={false}
          onShowModelAnswer={vi.fn()}
          onSelectQuestion={vi.fn()}
        />
      </LanguageProvider>
    );

    // Overall Score and Tier
    expect(screen.getByText("8.3")).toBeDefined();
    expect(screen.getByText(/Strong Technical Articulation/i)).toBeDefined();

    // Dimension breakdown
    expect(screen.getByText("9/10")).toBeDefined(); // Technical
    expect(screen.getAllByText("8/10").length).toBeGreaterThanOrEqual(1); // Grammar & Clarity

    // Feedback content
    expect(screen.getByText(/Successfully addressed kubectl describe pod/i)).toBeDefined();

    // Benchmark Model Answer
    expect(screen.getByText(/When diagnosing a CrashLoopBackOff pod in production/i)).toBeDefined();

    // Probing follow-up questions
    expect(screen.getByText(/How would you configure pod anti-affinity/i)).toBeDefined();

    // Refine Answer button
    const refineBtn = screen.getByRole("button", { name: /Refine This Answer/i });
    expect(refineBtn).toBeDefined();
    fireEvent.click(refineBtn);
  });

  it("clears draft on confirmation when Clear button is clicked", () => {
    window.confirm = vi.fn().mockReturnValue(true);

    render(
      <LanguageProvider>
        <InterviewStudio
          question={MOCK_QUESTION}
          allQuestions={MOCK_ALL_QUESTIONS}
          onBack={vi.fn()}
          onSubmitAnswer={vi.fn()}
          isSubmitting={false}
          onShowModelAnswer={vi.fn()}
          onSelectQuestion={vi.fn()}
        />
      </LanguageProvider>
    );

    const textarea = screen.getByPlaceholderText(/Start speaking or typing your answer in English/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Draft to be cleared." } });
    expect(textarea.value).toBe("Draft to be cleared.");

    const clearBtn = screen.getByTitle(/Clear Draft/i);
    fireEvent.click(clearBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(textarea.value).toBe("");
  });
});

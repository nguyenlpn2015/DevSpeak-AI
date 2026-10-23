import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  checkBackendStatus,
  getQuestions,
  getQuestionById,
  submitEvaluation,
  ApiError,
} from "@/lib/api";

describe("API Client Test Suite (apps/web/src/lib/api.ts)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("checkBackendStatus", () => {
    it("returns isOnline=true when /readyz endpoint responds 200 OK", async () => {
      const mockResponse = {
        status: "ready",
        ai_provider: "mock",
        questions_loaded: 10,
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        })
      );

      const result = await checkBackendStatus();
      expect(result.isOnline).toBe(true);
      expect(result.provider).toBe("mock");
      expect(result.questionsLoaded).toBe(10);
    });

    it("returns isOnline=false when /readyz fetch rejects / throws", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("Connection refused"))
      );

      const result = await checkBackendStatus();
      expect(result.isOnline).toBe(false);
    });
  });

  describe("getQuestions", () => {
    it("fetches questions successfully with correct query params", async () => {
      const mockData = {
        total: 1,
        items: [
          {
            id: "devops-k8s-001",
            title: "Triage CrashLoopBackOff",
            prompt: "How do you triage a pod?",
            role: "devops",
            topic: "kubernetes",
            difficulty: "mid",
            competencies: ["Kubernetes", "Linux"],
          },
        ],
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await getQuestions({
        role: "devops",
        topic: "kubernetes",
        difficulty: "mid",
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const urlCalled = fetchMock.mock.calls[0][0] as string;
      expect(urlCalled).toContain("/api/v1/questions?role=devops&topic=kubernetes&difficulty=mid");
      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe("devops-k8s-001");
    });

    it("throws ApiError and DOES NOT silently return fake data on network failure", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("Network offline"))
      );

      await expect(getQuestions()).rejects.toThrow(ApiError);
      await expect(getQuestions()).rejects.toThrow(/Cannot connect to DevSpeak API/i);
    });

    it("throws ApiError when server returns HTTP 500", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          json: async () => ({ detail: "Internal server error in database" }),
        })
      );

      await expect(getQuestions()).rejects.toThrow("Internal server error in database");
    });
  });

  describe("getQuestionById", () => {
    it("returns complete Question detail for valid id", async () => {
      const mockQuestion = {
        id: "devops-k8s-001",
        title: "Triage CrashLoopBackOff",
        prompt: "How do you triage a pod?",
        role: "devops",
        topic: "kubernetes",
        difficulty: "mid",
        competencies: ["Kubernetes"],
        rubric: {
          key_concepts: ["kubectl describe", "kubectl logs"],
          star_method_applicable: false,
          evaluation_criteria: ["Explains triage steps"],
          common_pitfalls: ["Restarting pod blindly"],
        },
        sample_answer: "I start by running kubectl describe pod...",
        follow_up_questions: ["What if the container was OOMKilled?"],
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockQuestion,
        })
      );

      const result = await getQuestionById("devops-k8s-001");
      expect(result.id).toBe("devops-k8s-001");
      expect(result.rubric.key_concepts).toContain("kubectl describe");
      expect(result.sample_answer).toContain("kubectl describe pod");
    });

    it("throws ApiError 404 when question is not found", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
          json: async () => ({ detail: "Not found" }),
        })
      );

      await expect(getQuestionById("non-existent-id")).rejects.toThrow(
        /not found in the question bank/i
      );
    });
  });

  describe("submitEvaluation", () => {
    it("submits answer payload and returns FeedbackReport", async () => {
      const mockFeedback = {
        question_id: "devops-k8s-001",
        scores: {
          grammar_score: 8,
          technical_score: 9,
          clarity_score: 8,
          overall_score: 8.3,
        },
        feedback: {
          grammar_feedback: ["Clear sentence structure."],
          technical_feedback: ["Accurate diagnostic commands."],
          clarity_structure_feedback: ["Chronological order followed."],
        },
        model_answer: "Benchmark answer text",
        suggested_followups: ["How to configure liveness probe?"],
        disclaimer: "Mock Heuristic Evaluation",
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockFeedback,
      });
      vi.stubGlobal("fetch", fetchMock);

      const answer = "First, I inspect the pod status with kubectl describe pod to see the termination reason.";
      const result = await submitEvaluation("devops-k8s-001", answer);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const call = fetchMock.mock.calls[0];
      expect(call[0]).toContain("/api/v1/interviews/evaluate");
      expect(call[1]?.method).toBe("POST");
      expect(JSON.parse(call[1]?.body as string)).toEqual({
        question_id: "devops-k8s-001",
        user_answer: answer,
      });

      expect(result.scores.overall_score).toBe(8.3);
      expect(result.feedback.technical_feedback).toHaveLength(1);
    });

    it("handles 422 validation error with descriptive message", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 422,
          json: async () => ({
            detail: [
              {
                loc: ["body", "user_answer"],
                msg: "String should have at least 10 characters",
                type: "string_too_short",
              },
            ],
          }),
        })
      );

      await expect(submitEvaluation("devops-k8s-001", "Short")).rejects.toThrow(
        /String should have at least 10 characters/i
      );
    });

    it("throws ApiError on network connection failure", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("Connection refused"))
      );

      await expect(
        submitEvaluation("devops-k8s-001", "A valid long answer that fails over network.")
      ).rejects.toThrow(/Cannot connect to evaluation engine/i);
    });
  });
});


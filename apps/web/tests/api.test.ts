import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  checkBackendStatus,
  getQuestions,
  getQuestionById,
  submitEvaluation,
  normalizeApiBaseUrl,
  buildApiUrl,
  getApiBaseUrl,
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

  describe("API Base URL Contract & Normalization (Workstream 1 Regression Suite)", () => {
    it("handles empty or nullish base URLs by returning empty string", () => {
      expect(normalizeApiBaseUrl("")).toBe("");
      expect(normalizeApiBaseUrl(null)).toBe("");
      expect(normalizeApiBaseUrl(undefined)).toBe("");
      expect(normalizeApiBaseUrl("   ")).toBe("");
    });

    it("handles origin-only URLs cleanly", () => {
      expect(normalizeApiBaseUrl("http://localhost")).toBe("http://localhost");
      expect(normalizeApiBaseUrl("http://localhost:8000")).toBe("http://localhost:8000");
      expect(normalizeApiBaseUrl("https://devspeak-api-prod.run.app")).toBe("https://devspeak-api-prod.run.app");
    });

    it("safely strips trailing slashes from origin-only URLs", () => {
      expect(normalizeApiBaseUrl("http://localhost/")).toBe("http://localhost");
      expect(normalizeApiBaseUrl("http://localhost:8000///")).toBe("http://localhost:8000");
      expect(normalizeApiBaseUrl("https://devspeak-api-prod.run.app/")).toBe("https://devspeak-api-prod.run.app");
    });

    it("safely strips redundant /api/v1 suffix from base URL", () => {
      expect(normalizeApiBaseUrl("http://localhost/api/v1")).toBe("http://localhost");
      expect(normalizeApiBaseUrl("http://localhost/api/v1/")).toBe("http://localhost");
      expect(normalizeApiBaseUrl("/api/v1")).toBe("");
      expect(normalizeApiBaseUrl("/api/v1/")).toBe("");
    });

    it("safely strips duplicate or malformed trailing path segments", () => {
      expect(normalizeApiBaseUrl("http://localhost/api/v1/api/v1")).toBe("http://localhost");
      expect(normalizeApiBaseUrl("http://localhost/api/v1/api/v1///")).toBe("http://localhost");
      expect(normalizeApiBaseUrl("/api/v1/api/v1")).toBe("");
    });

    it("preserves intentional subpaths while removing trailing /api/v1", () => {
      expect(normalizeApiBaseUrl("https://example.com/subapp")).toBe("https://example.com/subapp");
      expect(normalizeApiBaseUrl("https://example.com/subapp/api/v1")).toBe("https://example.com/subapp");
    });

    it("buildApiUrl constructs consistent endpoints without duplicate /api/v1 or double slashes", () => {
      // 1. Empty base URL (e.g. GKE origin-relative)
      expect(buildApiUrl("/api/v1/questions", "")).toBe("/api/v1/questions");
      expect(buildApiUrl("/readyz", "")).toBe("/readyz");

      // 2. Origin-only URL (e.g. Local kind with Ingress)
      expect(buildApiUrl("/api/v1/questions", "http://localhost")).toBe("http://localhost/api/v1/questions");
      expect(buildApiUrl("/readyz", "http://localhost")).toBe("http://localhost/readyz");

      // 3. Trailing slash on origin (e.g. Docker Compose or direct port)
      expect(buildApiUrl("/api/v1/questions", "http://localhost:8000/")).toBe("http://localhost:8000/api/v1/questions");
      expect(buildApiUrl("/readyz", "http://localhost:8000/")).toBe("http://localhost:8000/readyz");

      // 4. Misconfigured base URL with /api/v1 (e.g. the previous P0 bug in Helm values)
      expect(buildApiUrl("/api/v1/questions", "http://localhost/api/v1")).toBe("http://localhost/api/v1/questions");
      expect(buildApiUrl("/readyz", "http://localhost/api/v1")).toBe("http://localhost/readyz");
      expect(buildApiUrl("/api/v1/questions", "/api/v1")).toBe("/api/v1/questions");

      // 5. Cloud Run production absolute URL
      const prodApi = "https://devspeak-api-prod-echdk2yn-as.a.run.app";
      expect(buildApiUrl("/api/v1/questions", prodApi)).toBe(
        "https://devspeak-api-prod-echdk2yn-as.a.run.app/api/v1/questions"
      );
      expect(buildApiUrl("/api/v1/interviews/sessions", `${prodApi}/`)).toBe(
        "https://devspeak-api-prod-echdk2yn-as.a.run.app/api/v1/interviews/sessions"
      );
      expect(buildApiUrl("/readyz", `${prodApi}/api/v1`)).toBe(
        "https://devspeak-api-prod-echdk2yn-as.a.run.app/readyz"
      );

      // 6. Path without leading slash
      expect(buildApiUrl("api/v1/questions", "http://localhost")).toBe("http://localhost/api/v1/questions");
    });

    it("respects window.__NEXT_PUBLIC_API_URL runtime injection in browser context", () => {
      (window as unknown as { __NEXT_PUBLIC_API_URL?: string }).__NEXT_PUBLIC_API_URL = "http://localhost/api/v1";
      expect(getApiBaseUrl()).toBe("http://localhost");

      (window as unknown as { __NEXT_PUBLIC_API_URL?: string }).__NEXT_PUBLIC_API_URL = "";
      expect(getApiBaseUrl()).toBe("");

      (window as unknown as { __NEXT_PUBLIC_API_URL?: string }).__NEXT_PUBLIC_API_URL = "https://custom-api.run.app/";
      expect(getApiBaseUrl()).toBe("https://custom-api.run.app");

      delete (window as unknown as { __NEXT_PUBLIC_API_URL?: string }).__NEXT_PUBLIC_API_URL;
    });
  });
});


import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getProgressSummary,
  getSessionMessages,
  sendChatTurn,
  getAuthToken,
  setAuthToken,
  getAuthHeaders,
} from "@/lib/api";

describe("API Extensions (Chat, Progress & Auth Headers)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setAuthToken(null);
  });

  it("manages auth tokens and generates Bearer authorization headers", () => {
    expect(getAuthToken()).toBeNull();
    expect(getAuthHeaders()).toEqual({ Accept: "application/json" });

    setAuthToken("sample-jwt-token-xyz");
    expect(getAuthToken()).toBe("sample-jwt-token-xyz");
    expect(getAuthHeaders()).toEqual({
      Accept: "application/json",
      Authorization: "Bearer sample-jwt-token-xyz",
    });

    setAuthToken(null);
    expect(getAuthToken()).toBeNull();
  });

  it("fetches progress summary successfully", async () => {
    const mockData = {
      total_completed_sessions: 5,
      total_attempts: 12,
      average_overall_score: 8.4,
      xp_earned: 450,
      streak_days: 3,
      category_scores: [{ topic: "kubernetes", average_score: 8.5, attempts_count: 6 }],
      recent_activity: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    } as Response);

    const result = await getProgressSummary();
    expect(result.total_completed_sessions).toBe(5);
    expect(result.average_overall_score).toBe(8.4);
    expect(result.streak_days).toBe(3);
  });

  it("fetches session messages and sends chat turns", async () => {
    const mockMessages = [
      {
        id: "m-1",
        session_id: "s-1",
        role: "interviewer",
        content: "What is CrashLoopBackOff?",
        turn_index: 0,
        created_at: new Date().toISOString(),
      },
    ];

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockMessages,
    } as Response);

    const messages = await getSessionMessages("s-1");
    expect(messages.length).toBe(1);
    expect(messages[0].role).toBe("interviewer");

    const mockChatTurnResponse = {
      session_id: "s-1",
      interviewer_reply: "Good answer. How do you check exit codes?",
      is_concluding: false,
      turn_index: 2,
      feedback: null,
      messages: [],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockChatTurnResponse,
    } as Response);

    const turnRes = await sendChatTurn("s-1", "I inspect logs with kubectl logs.");
    expect(turnRes.interviewer_reply).toContain("Good answer");
    expect(turnRes.is_concluding).toBe(false);
  });
});

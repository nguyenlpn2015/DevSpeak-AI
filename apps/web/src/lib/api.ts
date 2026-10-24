import {
  Question,
  QuestionListResponse,
  FeedbackReport,
  InterviewSession,
  InterviewSessionDetail,
  InterviewAttempt,
  SessionListResponse,
  InterviewMessage,
  ChatTurnResponse,
  User,
  TokenResponse,
  ProgressSummary,
} from "@/types";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const runtimeUrl = (window as unknown as { __NEXT_PUBLIC_API_URL?: string }).__NEXT_PUBLIC_API_URL;
    if (runtimeUrl) {
      return runtimeUrl;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
}

let memoryToken: string | null = null;

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("devspeak_auth_token") || memoryToken;
  }
  return memoryToken;
}

export function setAuthToken(token: string | null): void {
  memoryToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("devspeak_auth_token", token);
    } else {
      localStorage.removeItem("devspeak_auth_token");
    }
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function checkBackendStatus(): Promise<{
  isOnline: boolean;
  environment?: string;
  provider?: string;
  questionsLoaded?: number;
}> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/readyz`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        isOnline: true,
        environment: "development",
        provider: data.ai_provider || "mock",
        questionsLoaded: data.questions_loaded,
      };
    }
  } catch {
    // Backend probe failed
  }

  return { isOnline: false };
}

export async function getQuestions(params?: {
  role?: string;
  topic?: string;
  difficulty?: string;
}): Promise<QuestionListResponse> {
  const query = new URLSearchParams();
  if (params?.role && params.role !== "all") query.set("role", params.role);
  if (params?.topic && params.topic !== "all") query.set("topic", params.topic);
  if (params?.difficulty && params.difficulty !== "all")
    query.set("difficulty", params.difficulty);

  const qs = query.toString();
  const url = `${getApiBaseUrl()}/api/v1/questions${qs ? `?${qs}` : ""}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    throw new ApiError(
      `Cannot connect to DevSpeak API at ${getApiBaseUrl()}. Ensure the backend service is running on port 8000.`,
      0
    );
  }

  if (!res.ok) {
    let errMsg = `Failed to fetch questions (HTTP ${res.status})`;
    try {
      const errData = await res.json();
      if (errData?.detail) {
        errMsg =
          typeof errData.detail === "string"
            ? errData.detail
            : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new ApiError(errMsg, res.status);
  }

  return await res.json();
}

export async function getQuestionById(id: string): Promise<Question> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/api/v1/questions/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    throw new ApiError(
      `Cannot connect to DevSpeak API to fetch question '${id}'. Ensure the backend service is running.`,
      0
    );
  }

  if (res.status === 404) {
    throw new ApiError(`Question '${id}' was not found in the question bank.`, 404);
  }

  if (!res.ok) {
    throw new ApiError(`Failed to fetch question '${id}' (HTTP ${res.status}).`, res.status);
  }

  return await res.json();
}

export async function submitEvaluation(
  questionId: string,
  userAnswer: string,
  sessionId?: string
): Promise<FeedbackReport> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/api/v1/interviews/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        question_id: questionId,
        user_answer: userAnswer,
        session_id: sessionId,
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new ApiError(
      `Cannot connect to evaluation engine at ${getApiBaseUrl()}. Ensure the backend service is running.`,
      0
    );
  }

  if (res.status === 422) {
    const errData = await res.json();
    const msg =
      errData?.detail?.[0]?.msg ||
      "Invalid submission: response must be between 10 and 4000 characters.";
    throw new ApiError(msg, 422, errData);
  }

  if (res.status === 404) {
    throw new ApiError(`Question '${questionId}' not found on server.`, 404);
  }

  if (!res.ok) {
    throw new ApiError(`Evaluation failed with status ${res.status}.`, res.status);
  }

  return await res.json();
}

export async function createSession(
  questionId: string,
  metadata: Record<string, unknown> = {}
): Promise<InterviewSession> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/api/v1/interviews/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        question_id: questionId,
        metadata,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    throw new ApiError(
      `Cannot connect to DevSpeak API to create session at ${getApiBaseUrl()}.`,
      0
    );
  }

  if (res.status === 404) {
    throw new ApiError(`Question '${questionId}' not found in catalog.`, 404);
  }

  if (!res.ok) {
    throw new ApiError(`Failed to create interview session (HTTP ${res.status}).`, res.status);
  }

  return await res.json();
}

export async function getSessionDetail(
  sessionId: string
): Promise<InterviewSessionDetail> {
  let res: Response;
  try {
    res = await fetch(
      `${getApiBaseUrl()}/api/v1/interviews/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: getAuthHeaders(),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    );
  } catch {
    throw new ApiError(
      `Cannot connect to DevSpeak API to fetch session '${sessionId}'.`,
      0
    );
  }

  if (res.status === 404) {
    throw new ApiError(`Session '${sessionId}' was not found.`, 404);
  }

  if (!res.ok) {
    throw new ApiError(`Failed to fetch session (HTTP ${res.status}).`, res.status);
  }

  return await res.json();
}

export async function listSessions(params?: {
  question_id?: string;
  limit?: number;
  offset?: number;
}): Promise<SessionListResponse> {
  const query = new URLSearchParams();
  if (params?.question_id) query.set("question_id", params.question_id);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));

  const qs = query.toString();
  const url = `${getApiBaseUrl()}/api/v1/interviews/sessions${qs ? `?${qs}` : ""}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: getAuthHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    throw new ApiError(
      `Cannot connect to DevSpeak API to list sessions at ${getApiBaseUrl()}.`,
      0
    );
  }

  if (!res.ok) {
    throw new ApiError(`Failed to list interview sessions (HTTP ${res.status}).`, res.status);
  }

  return await res.json();
}

export async function submitSessionAttempt(
  sessionId: string,
  userAnswer: string
): Promise<InterviewAttempt> {
  let res: Response;
  try {
    res = await fetch(
      `${getApiBaseUrl()}/api/v1/interviews/sessions/${encodeURIComponent(sessionId)}/attempts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ user_answer: userAnswer }),
        signal: AbortSignal.timeout(8000),
      }
    );
  } catch {
    throw new ApiError(
      `Cannot connect to evaluation engine at ${getApiBaseUrl()}.`,
      0
    );
  }

  if (res.status === 422) {
    const errData = await res.json();
    const msg =
      errData?.detail?.[0]?.msg ||
      "Invalid submission: response must be between 10 and 4000 characters.";
    throw new ApiError(msg, 422, errData);
  }

  if (res.status === 404) {
    throw new ApiError(`Session '${sessionId}' not found.`, 404);
  }

  if (!res.ok) {
    throw new ApiError(`Evaluation failed with status ${res.status}.`, res.status);
  }

  return await res.json();
}

export async function getSessionMessages(
  sessionId: string
): Promise<InterviewMessage[]> {
  let res: Response;
  try {
    res = await fetch(
      `${getApiBaseUrl()}/api/v1/interviews/sessions/${encodeURIComponent(sessionId)}/messages`,
      {
        headers: getAuthHeaders(),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    );
  } catch {
    throw new ApiError(
      `Cannot connect to DevSpeak API to fetch messages for session '${sessionId}'.`,
      0
    );
  }

  if (res.status === 404) {
    throw new ApiError(`Session '${sessionId}' was not found.`, 404);
  }

  if (!res.ok) {
    throw new ApiError(`Failed to fetch session messages (HTTP ${res.status}).`, res.status);
  }

  return await res.json();
}

export async function sendChatTurn(
  sessionId: string,
  message: string
): Promise<ChatTurnResponse> {
  let res: Response;
  try {
    res = await fetch(
      `${getApiBaseUrl()}/api/v1/interviews/sessions/${encodeURIComponent(sessionId)}/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ message }),
        signal: AbortSignal.timeout(10000),
      }
    );
  } catch {
    throw new ApiError(
      `Cannot connect to AI interviewer service at ${getApiBaseUrl()}.`,
      0
    );
  }

  if (res.status === 404) {
    throw new ApiError(`Session '${sessionId}' was not found.`, 404);
  }

  if (res.status === 403) {
    throw new ApiError("You do not have permission to chat in this session.", 403);
  }

  if (!res.ok) {
    throw new ApiError(`Chat turn failed with status ${res.status}.`, res.status);
  }

  return await res.json();
}

export async function getProgressSummary(): Promise<ProgressSummary> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/api/v1/progress/summary`, {
      headers: getAuthHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    throw new ApiError(
      `Cannot connect to DevSpeak API to fetch progress summary.`,
      0
    );
  }

  if (!res.ok) {
    throw new ApiError(`Failed to fetch progress summary (HTTP ${res.status}).`, res.status);
  }

  return await res.json();
}

export async function registerCandidate(payload: {
  email: string;
  password: string;
  full_name?: string;
  target_role?: string;
  target_level?: string;
}): Promise<TokenResponse> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });
  } catch {
    throw new ApiError(`Cannot connect to auth service at ${getApiBaseUrl()}.`, 0);
  }

  if (res.status === 409) {
    throw new ApiError("An account with this email address already exists.", 409);
  }

  if (!res.ok) {
    let errMsg = `Registration failed (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) errMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } catch {}
    throw new ApiError(errMsg, res.status);
  }

  const tokenData: TokenResponse = await res.json();
  setAuthToken(tokenData.access_token);
  return tokenData;
}

export async function loginCandidate(payload: {
  email: string;
  password: string;
}): Promise<TokenResponse> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });
  } catch {
    throw new ApiError(`Cannot connect to auth service at ${getApiBaseUrl()}.`, 0);
  }

  if (res.status === 401) {
    throw new ApiError("Invalid email or password.", 401);
  }

  if (!res.ok) {
    throw new ApiError(`Login failed with status ${res.status}.`, res.status);
  }

  const tokenData: TokenResponse = await res.json();
  setAuthToken(tokenData.access_token);
  return tokenData;
}

export async function getCurrentUser(): Promise<User> {
  const token = getAuthToken();
  if (!token) {
    throw new ApiError("No authentication token available.", 401);
  }

  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/api/v1/auth/me`, {
      headers: getAuthHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    throw new ApiError(`Cannot connect to auth service at ${getApiBaseUrl()}.`, 0);
  }

  if (res.status === 401) {
    setAuthToken(null);
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  if (!res.ok) {
    throw new ApiError(`Failed to fetch candidate profile (HTTP ${res.status}).`, res.status);
  }

  return await res.json();
}

export async function logoutCandidate(): Promise<void> {
  try {
    const token = getAuthToken();
    if (token) {
      await fetch(`${getApiBaseUrl()}/api/v1/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(3000),
      });
    }
  } catch {
    // Best-effort
  } finally {
    setAuthToken(null);
  }
}


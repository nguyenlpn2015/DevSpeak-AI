export type RoleCategory = "devops" | "cloud" | "backend" | "general_it";
export type Topic =
  | "kubernetes"
  | "cicd"
  | "docker"
  | "aws"
  | "linux_sre"
  | "system_design"
  | "behavioral";
export type Difficulty = "junior" | "mid" | "senior";

export interface QuestionRubric {
  key_concepts: string[];
  star_method_applicable: boolean;
  evaluation_criteria: string[];
  common_pitfalls: string[];
}

export interface Question {
  id: string;
  title: string;
  prompt: string;
  role: RoleCategory;
  topic: Topic;
  difficulty: Difficulty;
  competencies: string[];
  rubric: QuestionRubric;
  sample_answer: string;
  follow_up_questions: string[];
}

export interface QuestionSummary {
  id: string;
  title: string;
  prompt: string;
  role: RoleCategory;
  topic: Topic;
  difficulty: Difficulty;
  competencies: string[];
}

export interface QuestionListResponse {
  total: number;
  items: QuestionSummary[];
}

export interface ScoreBreakdown {
  grammar_score: number;
  technical_score: number;
  clarity_score: number;
  overall_score: number;
}

export interface FeedbackSection {
  grammar_feedback: string[];
  technical_feedback: string[];
  clarity_structure_feedback: string[];
}

export interface FeedbackReport {
  question_id: string;
  scores: ScoreBreakdown;
  feedback: FeedbackSection;
  model_answer: string;
  suggested_followups: string[];
  disclaimer: string;
}

export interface EvaluationRequest {
  question_id: string;
  user_answer: string;
  session_id?: string;
}

export interface InterviewSession {
  id: string;
  question_id: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  attempts_count?: number;
}

export interface InterviewAttempt {
  id: string;
  session_id: string;
  user_answer: string;
  feedback: FeedbackReport;
  overall_score: number | null;
  created_at: string;
}

export interface InterviewSessionDetail extends InterviewSession {
  attempts: InterviewAttempt[];
  messages?: InterviewMessage[];
}

export interface InterviewMessage {
  id: string;
  session_id: string;
  role: "interviewer" | "candidate" | string;
  content: string;
  turn_index: number;
  feedback?: FeedbackReport | null;
  created_at: string;
}

export interface ChatTurnResponse {
  session_id: string;
  interviewer_reply: string;
  is_concluding: boolean;
  turn_index: number;
  feedback?: FeedbackReport | null;
  messages: InterviewMessage[];
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  target_role: string;
  target_level: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CategoryScore {
  topic: string;
  average_score: number;
  attempts_count: number;
}

export interface RecentActivityItem {
  session_id: string;
  question_id: string;
  question_title: string;
  score: number | null;
  timestamp: string;
  status: string;
}

export interface ProgressSummary {
  total_completed_sessions: number;
  total_attempts: number;
  average_overall_score: number;
  xp_earned: number;
  streak_days: number;
  category_scores: CategoryScore[];
  recent_activity: RecentActivityItem[];
}

export interface SessionListResponse {
  total: number;
  items: InterviewSession[];
}


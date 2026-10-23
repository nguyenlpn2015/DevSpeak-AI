"use client";

import React from "react";
import { Question, QuestionSummary, FeedbackReport } from "@/types";
import { InterviewStudio } from "./studio/InterviewStudio";

export interface PracticeStudioProps {
  question: Question;
  onBack: () => void;
  onSubmitAnswer: (userAnswer: string) => Promise<void>;
  isSubmitting: boolean;
  onShowModelAnswer: () => void;
  error?: string | null;
  report?: FeedbackReport | null;
  allQuestions?: QuestionSummary[];
  onSelectQuestion?: (id: string) => void;
  onNextQuestion?: () => void;
  onClearFeedback?: () => void;
}

export function PracticeStudio(props: PracticeStudioProps) {
  return <InterviewStudio {...props} />;
}

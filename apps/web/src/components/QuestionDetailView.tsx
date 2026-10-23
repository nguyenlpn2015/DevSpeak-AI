"use client";

import React, { useState } from "react";
import { Question } from "@/types";
import {
  ArrowLeft,
  Play,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  HelpCircle,
  Clock,
  Shield,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface QuestionDetailViewProps {
  question: Question;
  onBack: () => void;
  onStartPractice: (question: Question) => void;
}

export function QuestionDetailView({
  question,
  onBack,
  onStartPractice,
}: QuestionDetailViewProps) {
  const { t } = useLanguage();
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  const handleCopySampleAnswer = () => {
    navigator.clipboard.writeText(question.sample_answer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 w-fit cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> {t.detail.backBtn}
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 uppercase font-semibold">
            {question.role.replace("_", " ")}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-brand-400 font-medium capitalize">
            {question.topic.replace("_", " ")}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 capitalize">{question.difficulty} {t.detail.levelSuffix}</span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
            {t.detail.specBadge}
          </span>
          {question.rubric.star_method_applicable && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
              {t.detail.starBadge}
            </span>
          )}
          <div className="flex items-center text-xs text-slate-400 ml-auto space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.detail.targetTime}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {question.title}
        </h1>

        {/* Question Prompt */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 text-sm sm:text-base leading-relaxed">
          &ldquo;{question.prompt}&rdquo;
        </div>

        {/* Competencies Tags */}
        {question.competencies && question.competencies.length > 0 && (
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-400 mr-2">{t.detail.competenciesHeading}:</span>
            <div className="inline-flex flex-wrap gap-1.5 align-middle mt-1">
              {question.competencies.map((comp, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-950 text-slate-300 border border-slate-800"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Ready to test your response? Practice in the Mock Studio and receive instant heuristic AI feedback.
          </p>
          <button
            onClick={() => onStartPractice(question)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all inline-flex items-center justify-center cursor-pointer"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            {t.detail.startPracticeBtn}
          </button>
        </div>
      </div>

      {/* Two Column Layout: Rubric & Sample Answer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Rubric & Expectations */}
        <div className="space-y-6">
          {/* Key Concepts Expected */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.detail.keyConceptsHeading}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              International hiring panels specifically listen for precise technical terminology.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {question.rubric.key_concepts.map((concept, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-brand-950/60 text-brand-300 border border-brand-800/50"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>

          {/* Evaluation Criteria */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.detail.criteriaHeading}
              </h2>
            </div>
            <ul className="space-y-2 pt-1">
              {question.rubric.evaluation_criteria.map((crit, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed flex items-start space-x-2.5"
                >
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>{crit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Common Pitfalls */}
          {question.rubric.common_pitfalls.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t.detail.pitfallsHeading}
                </h2>
              </div>
              <ul className="space-y-2 pt-1">
                {question.rubric.common_pitfalls.map((pitfall, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs sm:text-sm text-amber-200/90 leading-relaxed flex items-start space-x-2.5"
                  >
                    <span className="text-amber-400 font-bold shrink-0 mt-0.5">!</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Benchmark Sample Answer & Probing Follow-ups */}
        <div className="space-y-6">
          {/* Sample Model Answer */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t.detail.benchmarkAnswerHeading}
                </h2>
              </div>
              <button
                onClick={handleCopySampleAnswer}
                className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors bg-slate-950 px-2.5 py-1 rounded border border-slate-800 cursor-pointer"
              >
                {copiedAnswer ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> {t.detail.copiedBtn}
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" /> {t.detail.copyAnswerBtn}
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Demonstrates natural pacing, clear structure, and high technical accuracy.
            </p>

            {/* Content rendered safely as plain text */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
              {question.sample_answer}
            </div>
          </div>

          {/* Follow-up Questions */}
          {question.follow_up_questions && question.follow_up_questions.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t.detail.followupsHeading}
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Be prepared to answer these immediate follow-up questions from the interviewer.
              </p>
              <div className="space-y-2 pt-1">
                {question.follow_up_questions.map((qText, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed"
                  >
                    &ldquo;{qText}&rdquo;
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Architecture Note */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-500 flex items-start space-x-2.5">
            <Shield className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              All question rubrics and model answers are validated against the backend schema and loaded offline with 0 cloud dependencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

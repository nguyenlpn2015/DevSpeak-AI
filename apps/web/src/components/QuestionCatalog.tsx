"use client";

import React, { useState } from "react";
import { QuestionSummary, Topic, Difficulty } from "@/types";
import {
  Search,
  Filter,
  ArrowRight,
  Layers,
  Cpu,
  Cloud,
  Terminal,
  ShieldAlert,
  GitBranch,
  Box,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface QuestionCatalogProps {
  questions: QuestionSummary[];
  loading: boolean;
  error?: string | null;
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  onViewDetail: (id: string) => void;
  onFilterChange: (filters: {
    role: string;
    topic: string;
    difficulty: string;
  }) => void;
  onRetry: () => void;
}

const TOPIC_BADGES: Record<
  Topic,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  kubernetes: {
    label: "Kubernetes",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    icon: <Layers className="w-3.5 h-3.5 mr-1" />,
  },
  cicd: {
    label: "CI/CD & Delivery",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: <GitBranch className="w-3.5 h-3.5 mr-1" />,
  },
  aws: {
    label: "AWS Cloud",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    icon: <Cloud className="w-3.5 h-3.5 mr-1" />,
  },
  linux_sre: {
    label: "Linux & SRE",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
    icon: <Terminal className="w-3.5 h-3.5 mr-1" />,
  },
  behavioral: {
    label: "Behavioral (STAR)",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
    icon: <ShieldAlert className="w-3.5 h-3.5 mr-1" />,
  },
  docker: {
    label: "Docker & Containers",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    icon: <Box className="w-3.5 h-3.5 mr-1" />,
  },
  system_design: {
    label: "System Design",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
    icon: <Cpu className="w-3.5 h-3.5 mr-1" />,
  },
};

const DIFFICULTY_STYLES: Record<Difficulty, { color: string }> = {
  junior: { color: "bg-slate-700/60 text-slate-300 border-slate-600" },
  mid: { color: "bg-blue-900/40 text-blue-300 border-blue-700/50" },
  senior: { color: "bg-purple-900/40 text-purple-300 border-purple-700/50" },
};

export function QuestionCatalog({
  questions,
  loading,
  error,
  selectedQuestionId,
  onSelectQuestion,
  onViewDetail,
  onFilterChange,
  onRetry,
}: QuestionCatalogProps) {
  const { t } = useLanguage();
  const [role, setRole] = useState<string>("all");
  const [topic, setTopic] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleRoleClick = (newRole: string) => {
    setRole(newRole);
    onFilterChange({ role: newRole, topic, difficulty });
  };

  const handleTopicClick = (newTopic: string) => {
    setTopic(newTopic);
    onFilterChange({ role, topic: newTopic, difficulty });
  };

  const handleDifficultyClick = (newDiff: string) => {
    setDifficulty(newDiff);
    onFilterChange({ role, topic, difficulty: newDiff });
  };

  const handleResetFilters = () => {
    setRole("all");
    setTopic("all");
    setDifficulty("all");
    setSearchQuery("");
    onFilterChange({ role: "all", topic: "all", difficulty: "all" });
  };

  const filteredQuestions = questions.filter((q) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.title.toLowerCase().includes(query) ||
      q.prompt.toLowerCase().includes(query) ||
      q.competencies?.some((c) => c.toLowerCase().includes(query))
    );
  });

  const getRoleLabel = (r: string) => {
    if (r === "all") return t.catalog.roleFilterAll;
    if (r === "devops") return t.catalog.roles.devops;
    if (r === "cloud") return t.catalog.roles.cloud;
    if (r === "general_it") return t.catalog.roles.general_it;
    return r.replace("_", " ");
  };

  const getDifficultyLabel = (d: string) => {
    if (d === "all") return t.catalog.diffFilterAll;
    if (d === "junior") return t.catalog.levels.junior;
    if (d === "mid") return t.catalog.levels.mid;
    if (d === "senior") return t.catalog.levels.senior;
    return d;
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.catalog.title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.catalog.title}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t.catalog.subtitle}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-lg backdrop-blur-sm">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.catalog.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          {/* Roles */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center">
              <Filter className="w-3 h-3 mr-1" /> {t.catalog.filterSummary}:
            </span>
            {["all", "devops", "cloud", "general_it"].map((r) => (
              <button
                key={r}
                onClick={() => handleRoleClick(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  role === r
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {getRoleLabel(r)}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1">Level:</span>
            {["all", "junior", "mid", "senior"].map((d) => (
              <button
                key={d}
                onClick={() => handleDifficultyClick(d)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  difficulty === d
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {getDifficultyLabel(d)}
              </button>
            ))}
          </div>
        </div>

        {/* Topics Quick Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-slate-800/40 pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Topics:</span>
          {["all", "kubernetes", "cicd", "aws", "linux_sre", "behavioral", "docker"].map((item) => (
            <button
              key={item}
              onClick={() => handleTopicClick(item)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all shrink-0 capitalize ${
                topic === item
                  ? "bg-slate-200 text-slate-900 font-semibold"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {item === "all" ? t.catalog.topicFilterAll : item.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area: Error State | Loading Skeletons | Empty State | Questions Grid */}
      <div className="space-y-4">
        {/* Error State: Strictly displayed instead of fake mock fallback */}
        {error ? (
          <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-center space-y-4 shadow-xl">
            <div className="h-12 w-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-base font-bold text-white">{t.catalog.errorTitle}</h3>
              <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
              <p className="text-[11px] text-slate-400">
                To run the backend locally, execute:{" "}
                <code className="text-brand-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  python -m uvicorn src.main:app --port 8000
                </code>
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onRetry}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all inline-flex items-center space-x-2 shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.catalog.retryCta}</span>
              </button>
            </div>
          </div>
        ) : loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl p-5 border border-slate-800 bg-slate-900/50 animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 w-24 bg-slate-800 rounded-full" />
                  <div className="h-4 w-16 bg-slate-800 rounded" />
                </div>
                <div className="h-5 w-3/4 bg-slate-800 rounded" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-800 rounded" />
                  <div className="h-3 w-5/6 bg-slate-800 rounded" />
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-4 w-16 bg-slate-800 rounded" />
                  <div className="h-4 w-20 bg-slate-800 rounded" />
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <div className="h-4 w-24 bg-slate-800 rounded" />
                  <div className="h-4 w-20 bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredQuestions.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 px-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
            <div className="h-12 w-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
              <Filter className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-bold text-white">{t.catalog.emptyTitle}</h3>
              <p className="text-xs text-slate-400">{t.catalog.emptyDesc}</p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.catalog.resetFilters}</span>
            </button>
          </div>
        ) : (
          /* Questions Grid */
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t.catalog.showingQuestions} ({filteredQuestions.length})
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQuestions.map((q) => {
                const topicMeta = TOPIC_BADGES[q.topic] || {
                  label: q.topic,
                  bg: "bg-slate-800",
                  text: "text-slate-300",
                  border: "border-slate-700",
                  icon: null,
                };
                const diffMeta = DIFFICULTY_STYLES[q.difficulty] || DIFFICULTY_STYLES.mid;
                const isSelected = selectedQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    className={`group rounded-xl p-5 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-brand-950/40 border-brand-500/80 ring-2 ring-brand-500/30 shadow-lg shadow-brand-500/10"
                        : "bg-slate-900/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850 hover:shadow-md"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Tags row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${topicMeta.bg} ${topicMeta.text} ${topicMeta.border}`}
                          >
                            {topicMeta.icon}
                            {topicMeta.label}
                          </span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${diffMeta.color}`}
                          >
                            {getDifficultyLabel(q.difficulty)}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                          {q.role.replace("_", " ")}
                        </span>
                      </div>

                      {/* Question Title */}
                      <h3
                        onClick={() => onViewDetail(q.id)}
                        className="text-base font-semibold text-white group-hover:text-brand-300 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {q.title}
                      </h3>

                      {/* Prompt Snippet */}
                      <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {q.prompt}
                      </p>

                      {/* Competencies */}
                      {q.competencies && q.competencies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {q.competencies.slice(0, 3).map((comp, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                            >
                              {comp}
                            </span>
                          ))}
                          {q.competencies.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-500">
                              +{q.competencies.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dual Action Buttons: View Details & Start Mock */}
                    <div className="pt-4 mt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium gap-2">
                      <button
                        onClick={() => onViewDetail(q.id)}
                        className="inline-flex items-center text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        <span>{t.catalog.rubricBtn}</span>
                      </button>

                      <button
                        onClick={() => onSelectQuestion(q.id)}
                        className="inline-flex items-center text-brand-400 hover:text-brand-300 px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 transition-all font-semibold cursor-pointer"
                      >
                        <span>{t.catalog.practiceBtn}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

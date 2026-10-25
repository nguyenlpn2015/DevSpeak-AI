"use client";

import React from "react";
import {
  Flame,
  Sparkles,
  Target,
  Trophy,
  Layers,
  Terminal,
  Cloud,
  Cpu,
  GitBranch,
  ShieldAlert,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { MetricCards } from "./MetricCards";
import { WeeklyProgressChart } from "./WeeklyProgressChart";
import { StreakCalendar } from "./StreakCalendar";
import { ContinueLearningSection } from "./ContinueLearningSection";
import { GoalsAndAchievements } from "./GoalsAndAchievements";

interface LinguaFlowDashboardProps {
  onStartAction: (
    action: "flashcards" | "shadowing" | "studio" | "exercises"
  ) => void;
  dayStreak?: number;
  totalXP?: string | number;
  wordsLearned?: number;
  level?: number;
}

export function LinguaFlowDashboard({
  onStartAction,
  dayStreak = 12,
  totalXP = "2.840",
  wordsLearned = 184,
  level = 6,
}: LinguaFlowDashboardProps) {
  const { t } = useLanguage();

  const cefrLevels = [
    { code: "A1", label: "Beginner" },
    { code: "A2", label: "Elementary" },
    { code: "B1", label: "Intermediate" },
    { code: "B2", label: "Upper-Int (Target)" },
    { code: "C1", label: "Advanced" },
    { code: "C2", label: "Mastery" },
  ];

  const quickTracks = [
    {
      id: "k8s",
      name: "Kubernetes Core",
      icon: <Cpu className="w-3.5 h-3.5 text-[#315BFF]" />,
      action: "studio" as const,
    },
    {
      id: "cicd",
      name: "CI/CD & Canary",
      icon: <GitBranch className="w-3.5 h-3.5 text-[#EC007A]" />,
      action: "studio" as const,
    },
    {
      id: "linux",
      name: "Linux SRE & Triage",
      icon: <Terminal className="w-3.5 h-3.5 text-[#009F83]" />,
      action: "studio" as const,
    },
    {
      id: "aws",
      name: "AWS Multi-AZ Arch",
      icon: <Cloud className="w-3.5 h-3.5 text-[#FF7A00]" />,
      action: "studio" as const,
    },
    {
      id: "star",
      name: "STAR Behavioral",
      icon: <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />,
      action: "exercises" as const,
    },
  ];

  return (
    <div className="space-y-6 pb-2 animate-in fade-in duration-300">
      {/* Top Header Banner: Greeting + CEFR Level Progression Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Greeting & Streak */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30 shadow-sm shadow-[#FF7A00]/10">
            <Flame className="w-4 h-4 fill-current text-[#FF7A00] animate-pulse" />
            <span>{t.flowDashboard.streakBanner}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{t.flowDashboard.greeting}</span>
            <span className="inline-block hover:rotate-12 transition-transform cursor-default">
              👋
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[#9286C7] font-medium max-w-2xl leading-relaxed">
            {t.flowDashboard.greetingSub}
          </p>
        </div>

        {/* Right: Current Level Card matching the screenshot */}
        <div className="p-4 rounded-2xl bg-[#0D0920] border border-[#1F1538] shadow-sm space-y-2.5 min-w-[280px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9286C7]">
              <Target className="w-3.5 h-3.5 text-[#A855F7]" />
              <span>{t.flowDashboard.currentLevel}</span>
            </div>
            <span className="text-[10px] font-semibold text-[#009F83] bg-[#009F83]/15 px-2 py-0.5 rounded-full border border-[#009F83]/30">
              Tier 1 SRE Track
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-[#A855F7] tracking-tight">
              B2
            </span>
            <span className="text-xs text-[#9286C7] font-medium">
              {t.flowDashboard.upperIntermediate}
            </span>
          </div>

          {/* CEFR Level Track */}
          <div className="flex items-center justify-between gap-1 pt-1">
            {cefrLevels.map((lvl) => {
              const isCurrent = lvl.code === "B2";
              return (
                <div
                  key={lvl.code}
                  title={lvl.label}
                  className={`text-[9px] font-bold px-2 py-1 rounded-lg text-center transition-all cursor-default ${
                    isCurrent
                      ? "bg-[#8B20F5] text-white shadow-md shadow-[#8B20F5]/50 scale-105 ring-1 ring-[#A855F7]"
                      : "text-[#6B5E99] bg-[#120C26] hover:text-[#9286C7]"
                  }`}
                >
                  {lvl.code}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row of 4 Metric Cards */}
      <MetricCards
        dayStreak={dayStreak}
        totalXP={totalXP}
        wordsLearned={wordsLearned}
        level={level}
      />

      {/* Quick Track Shortcuts */}
      <div className="p-3.5 rounded-2xl bg-[#0D0920] border border-[#1F1538] flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#9286C7] px-1">
          <Terminal className="w-4 h-4 text-[#8B20F5]" />
          <span>{t.flowDashboard.quickTracksLabel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {quickTracks.map((track) => (
            <button
              key={track.id}
              onClick={() => onStartAction(track.action)}
              className="px-3 py-1.5 rounded-xl bg-[#120C26] hover:bg-[#1A1235] text-xs font-medium text-[#F5F3FF] border border-[#1F1538] hover:border-[#8B20F5]/40 transition-all flex items-center space-x-1.5 cursor-pointer group shadow-sm"
            >
              {track.icon}
              <span className="group-hover:text-white transition-colors">
                {track.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Middle Row: Weekly Progress Chart + Streak Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <WeeklyProgressChart />
        </div>
        <div className="lg:col-span-5">
          <StreakCalendar streakDays={dayStreak} />
        </div>
      </div>

      {/* Continue Learning Row (4 Vivid Cards) */}
      <ContinueLearningSection onSelectAction={onStartAction} />

      {/* Bottom Row: Today's Goals + Achievements */}
      <GoalsAndAchievements />
    </div>
  );
}

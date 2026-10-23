"use client";

import React from "react";
import { Calendar, Flame } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface StreakCalendarProps {
  streakDays?: number;
  xpCurrent?: number;
  xpTarget?: number;
  levelName?: string;
}

export function StreakCalendar({
  streakDays = 12,
  xpCurrent = 340,
  xpTarget = 500,
  levelName = "Level 6 Progress",
}: StreakCalendarProps) {
  const { t } = useLanguage();

  const weekDays = [
    { day: "W", completed: false },
    { day: "T", completed: false },
    { day: "F", completed: true },
    { day: "S", completed: true },
    { day: "S", completed: true },
    { day: "M", completed: true },
    { day: "T", completed: true },
  ];

  const progressPercent = Math.min(
    Math.round((xpCurrent / xpTarget) * 100),
    100
  );

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0D0920] border border-[#1F1538] shadow-sm flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Calendar className="w-4 h-4 text-[#A855F7]" />
        <h3 className="text-base font-bold text-white tracking-tight">
          {t.flowDashboard.streakCalendar.title}
        </h3>
      </div>

      {/* Week Day Indicator Circles */}
      <div className="flex items-center justify-between px-1">
        {weekDays.map((w, i) => (
          <div key={i} className="flex flex-col items-center space-y-1.5">
            <span className="text-[10px] font-semibold text-[#9286C7]">
              {w.day}
            </span>
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                w.completed
                  ? "bg-[#8B20F5] text-white shadow-md shadow-[#8B20F5]/40 ring-2 ring-[#A855F7]/30"
                  : "bg-[#160F2E] text-[#6B5E99] border border-[#2D1E4E]"
              }`}
            >
              {w.completed ? (
                <Flame className="w-3.5 h-3.5 fill-current text-white" />
              ) : (
                <span className="text-[10px] font-mono">•</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Center Hero: Flame + Big Number */}
      <div className="py-2 flex flex-col items-center justify-center text-center space-y-1">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-10 w-10 rounded-2xl bg-[#FF7A00]/20 border border-[#FF7A00]/40 flex items-center justify-center shadow-lg shadow-[#FF7A00]/20">
            <Flame className="w-6 h-6 text-[#FF7A00] fill-current animate-pulse" />
          </div>
          <span className="text-4xl font-black text-white tracking-tight">
            {streakDays}
          </span>
        </div>
        <p className="text-xs text-[#9286C7] font-medium">
          {t.flowDashboard.streakCalendar.daysInRow}
        </p>
      </div>

      {/* Level Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-[11px] font-medium">
          <span className="text-white font-semibold">{levelName}</span>
          <span className="text-[#9286C7] font-mono">
            {xpCurrent}/{xpTarget} XP
          </span>
        </div>
        <div className="h-2 w-full bg-[#160F2E] rounded-full overflow-hidden p-0.5 border border-[#1F1538]">
          <div
            className="h-full bg-gradient-to-r from-[#8B20F5] to-[#A855F7] rounded-full shadow-sm shadow-[#8B20F5] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}


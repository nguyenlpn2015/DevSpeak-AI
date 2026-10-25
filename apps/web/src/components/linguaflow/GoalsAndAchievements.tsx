"use client";

import React from "react";
import {
  Target,
  Award,
  CheckCircle2,
  Circle,
  Zap,
  Layers,
  Bot,
  Crown,
  ShieldCheck,
  Cpu,
  Trophy,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function GoalsAndAchievements() {
  const { t } = useLanguage();

  const goals = [
    {
      id: "goal1",
      title: t.flowDashboard.todayGoals.goal1,
      subtitle: t.flowDashboard.todayGoals.goal1Sub,
      progress: 68,
      completed: false,
      icon: <Zap className="w-4 h-4 text-[#F59E0B]" />,
      barColor: "from-[#F59E0B] to-[#FF7A00]",
    },
    {
      id: "goal2",
      title: t.flowDashboard.todayGoals.goal2,
      subtitle: t.flowDashboard.todayGoals.goal2Sub,
      progress: 60,
      completed: false,
      icon: <Layers className="w-4 h-4 text-[#A855F7]" />,
      barColor: "from-[#8B20F5] to-[#A855F7]",
    },
    {
      id: "goal3",
      title: t.flowDashboard.todayGoals.goal3,
      subtitle: t.flowDashboard.todayGoals.goal3Sub,
      progress: 100,
      completed: true,
      icon: <Bot className="w-4 h-4 text-[#315BFF]" />,
      barColor: "from-[#315BFF] to-[#009F83]",
    },
  ];

  const badges = [
    {
      id: "b1",
      title: t.flowDashboard.achievements.badge1,
      desc: t.flowDashboard.achievements.badge1Desc,
      icon: <Zap className="w-5 h-5 text-[#A855F7]" />,
      bg: "bg-[#8B20F5]/15 border-[#8B20F5]/30 group-hover:border-[#8B20F5]/60",
      status: "unlocked",
    },
    {
      id: "b2",
      title: t.flowDashboard.achievements.badge2,
      desc: t.flowDashboard.achievements.badge2Desc,
      icon: <Crown className="w-5 h-5 text-[#315BFF]" />,
      bg: "bg-[#315BFF]/15 border-[#315BFF]/30 group-hover:border-[#315BFF]/60",
      status: "unlocked",
    },
    {
      id: "b3",
      title: t.flowDashboard.achievements.badge3,
      desc: t.flowDashboard.achievements.badge3Desc,
      icon: <ShieldCheck className="w-5 h-5 text-[#EC007A]" />,
      bg: "bg-[#EC007A]/15 border-[#EC007A]/30 group-hover:border-[#EC007A]/60",
      status: "unlocked",
    },
    {
      id: "b4",
      title: t.flowDashboard.achievements.badge4,
      desc: t.flowDashboard.achievements.badge4Desc,
      icon: <Cpu className="w-5 h-5 text-[#009F83]" />,
      bg: "bg-[#009F83]/15 border-[#009F83]/30 group-hover:border-[#009F83]/60",
      status: "unlocked",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: Today's Goals */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0D0920] border border-[#1F1538] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-xl bg-[#8B20F5]/20 border border-[#8B20F5]/30 flex items-center justify-center">
              <Target className="w-4 h-4 text-[#A855F7]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {t.flowDashboard.todayGoals.title}
              </h3>
              <p className="text-[11px] text-[#9286C7]">
                {t.flowDashboard.todayGoals.subtitle}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#160F2E] text-[#9286C7] border border-[#1F1538]">
            {t.flowDashboard.todayGoals.completedBadge}
          </span>
        </div>

        <div className="space-y-3">
          {goals.map((g) => (
            <div
              key={g.id}
              className="p-3.5 rounded-xl bg-[#120C26] border border-[#1F1538] space-y-2 hover:border-[#8B20F5]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-[#080613] border border-[#1F1538]">
                    {g.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {g.title}
                    </span>
                    <span className="text-[10px] text-[#9286C7]">
                      {g.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-[#F5F3FF]">
                    {g.progress}%
                  </span>
                  {g.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#009F83] shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#8B20F5] shrink-0" />
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-[#080613] rounded-full overflow-hidden p-0.5 border border-[#1F1538]">
                <div
                  className={`h-full bg-gradient-to-r ${g.barColor} rounded-full transition-all duration-500 shadow-sm`}
                  style={{ width: `${g.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Achievements Badges */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0D0920] border border-[#1F1538] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-xl bg-[#009F83]/20 border border-[#009F83]/30 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-[#009F83]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {t.flowDashboard.achievements.title}
              </h3>
              <p className="text-[11px] text-[#9286C7]">
                {t.flowDashboard.achievements.subtitle}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#009F83]/15 text-[#009F83] border border-[#009F83]/30">
            {t.flowDashboard.achievements.unlockedBadge}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3.5 rounded-xl bg-[#120C26] border border-[#1F1538] flex flex-col justify-between space-y-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group cursor-default`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center border ${b.bg} transition-colors`}
                >
                  {b.icon}
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#009F83]" />
              </div>

              <div>
                <span className="text-xs font-bold text-white block group-hover:text-[#A855F7] transition-colors">
                  {b.title}
                </span>
                <span className="text-[10px] text-[#9286C7] line-clamp-1 mt-0.5">
                  {b.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

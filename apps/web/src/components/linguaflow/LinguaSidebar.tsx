"use client";

import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Bookmark,
  Mic,
  Bot,
  Sparkles,
  Lightbulb,
  Flame,
  X,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export type NavItem =
  | "dashboard"
  | "catalog"
  | "flashcards"
  | "vocab"
  | "shadowing"
  | "practice"
  | "star";

interface LinguaSidebarProps {
  currentNav: NavItem;
  onNavigate: (nav: NavItem) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  streakDays?: number;
  totalXp?: number;
}

export function LinguaSidebar({
  currentNav,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile,
  streakDays = 1,
  totalXp = 50,
}: LinguaSidebarProps) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    {
      id: "dashboard" as NavItem,
      label: t.linguaSidebar.dashboard,
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "catalog" as NavItem,
      label: t.linguaSidebar.questionBank,
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "flashcards" as NavItem,
      label: t.linguaSidebar.flashcards,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: "vocab" as NavItem,
      label: t.linguaSidebar.vocabVault,
      icon: <Bookmark className="w-4 h-4" />,
    },
    {
      id: "shadowing" as NavItem,
      label: t.linguaSidebar.shadowing,
      icon: <Mic className="w-4 h-4" />,
    },
    {
      id: "practice" as NavItem,
      label: t.linguaSidebar.aiConversation,
      icon: <Bot className="w-4 h-4" />,
      badge: "AI",
    },
    {
      id: "star" as NavItem,
      label: t.linguaSidebar.exercises,
      icon: <Sparkles className="w-4 h-4" />,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#080613] text-[#F5F3FF] p-4 border-r border-[#1F1538] w-64 lg:w-72 shrink-0 select-none">
      {/* Brand Logo & Header */}
      <div className="flex items-center justify-between pb-6 pt-2 px-1">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => onNavigate("dashboard")}
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#8B20F5] to-[#A855F7] flex items-center justify-center shadow-lg shadow-[#8B20F5]/30">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block">
              DevSpeak AI
            </span>
            <span className="text-[10px] text-[#9286C7] font-medium block">
              AI English Learning
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-[#9286C7] hover:text-white hover:bg-[#160F2E]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Streak & Level Widget Pill */}
      <div className="p-3.5 rounded-2xl bg-[#0D0920] border border-[#1F1538] space-y-2.5 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#FF7A00]">
            <Flame className="w-4 h-4 text-[#FF7A00] fill-current" />
            <span>{streakDays > 0 ? `${streakDays} Day Streak` : t.linguaSidebar.streak}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8B20F5]/30 text-[#A855F7] border border-[#8B20F5]/40">
            {user ? `${user.target_level} Level` : t.linguaSidebar.level}
          </span>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1">
          <div className="h-1.5 w-full bg-[#160F2E] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B20F5] to-[#A855F7] rounded-full shadow-sm shadow-[#8B20F5]"
              style={{ width: `${Math.min(100, Math.max(10, Math.round(((totalXp % 500) / 500) * 100)))}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-[#9286C7] font-mono">
            <span>{totalXp} XP</span>
            <span>{Math.ceil(Math.max(totalXp, 100) / 500) * 500} XP</span>
          </div>
        </div>
      </div>

      {/* LEARN Section Navigation */}
      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        <span className="text-[10px] font-bold tracking-widest text-[#6B5E99] px-3 uppercase mb-2 block">
          {t.linguaSidebar.learnSection}
        </span>

        {navItems.map((item) => {
          const isActive = currentNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#8B20F5] text-white shadow-lg shadow-[#8B20F5]/25"
                  : "text-[#9286C7] hover:text-white hover:bg-[#120C26]"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={isActive ? "text-white" : "text-[#9286C7]"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-white/20 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tip of the day Card */}
      <div className="p-3.5 rounded-2xl bg-[#120C26] border border-[#1F1538] space-y-1.5 mt-auto">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-[#A855F7]">
          <Lightbulb className="w-3.5 h-3.5 text-[#A855F7]" />
          <span>{t.linguaSidebar.tipTitle}</span>
        </div>
        <p className="text-[11px] text-[#9286C7] leading-relaxed">
          {t.linguaSidebar.tipContent}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}


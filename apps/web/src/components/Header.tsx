"use client";

import React from "react";
import {
  Terminal,
  Shield,
  Wifi,
  WifiOff,
  LayoutDashboard,
  BookOpen,
  Play,
  Menu,
  Sparkles,
  Bot,
  User as UserIcon,
  LogOut,
  LogIn,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface HeaderProps {
  isBackendLive: boolean;
  isBackendChecking?: boolean;
  activeTab: "home" | "catalog" | "detail" | "practice" | "feedback" | "flashcards" | "star";
  onTabChange: (tab: "home" | "catalog" | "practice" | "flashcards" | "star") => void;
  hasActiveQuestion: boolean;
  onRefreshHealth?: () => void;
  onToggleMobileMenu?: () => void;
}

export function Header({
  isBackendLive,
  isBackendChecking = false,
  activeTab,
  onTabChange,
  hasActiveQuestion,
  onRefreshHealth,
  onToggleMobileMenu,
}: HeaderProps) {
  const { t } = useLanguage();
  const { user, openAuthModal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#080613]/90 border-b border-[#1F1538] transition-all">
      <div className="w-full px-4 sm:px-6 xl:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Context Badge */}
        <div className="flex items-center space-x-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-[#9286C7] hover:text-white hover:bg-[#160F2E] transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Mobile Brand (hidden on desktop because sidebar is visible) */}
          <div
            className="flex lg:hidden items-center space-x-2.5 cursor-pointer"
            onClick={() => onTabChange("home")}
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#8B20F5] to-[#A855F7] flex items-center justify-center shadow-lg shadow-[#8B20F5]/30">
              <Terminal className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">
                {t.nav.brandName}
              </span>
            </div>
          </div>

          {/* Desktop Studio Pill & Track Badge */}
          <div className="hidden lg:flex items-center space-x-2.5">
            <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#0D0920] border border-[#1F1538] text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
              <span>AI Interview Studio</span>
              <span className="text-[#6B5E99]">•</span>
              <span className="text-[#9286C7] font-normal">IT & DevOps Track</span>
            </div>
          </div>
        </div>

        {/* Center: Quick Navigation Tabs */}
        <nav className="hidden sm:flex items-center space-x-1.5 sm:space-x-2">
          <button
            onClick={() => onTabChange("home")}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "home"
                ? "bg-[#8B20F5] text-white shadow-md shadow-[#8B20F5]/30"
                : "text-[#9286C7] hover:text-white hover:bg-[#120C26]"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t.nav.dashboard}</span>
          </button>

          <button
            onClick={() => onTabChange("catalog")}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "catalog" || activeTab === "detail"
                ? "bg-[#8B20F5] text-white shadow-md shadow-[#8B20F5]/30"
                : "text-[#9286C7] hover:text-white hover:bg-[#120C26]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.nav.questionBank}</span>
          </button>

          <button
            onClick={() => onTabChange("practice")}
            disabled={!hasActiveQuestion}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === "practice" || activeTab === "feedback"
                ? "bg-[#8B20F5] text-white shadow-md shadow-[#8B20F5]/30"
                : hasActiveQuestion
                ? "text-[#9286C7] hover:text-white hover:bg-[#120C26] cursor-pointer"
                : "text-[#6B5E99] opacity-50 cursor-not-allowed"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{t.nav.practiceStudio}</span>
          </button>
        </nav>

        {/* Right: Status Indicators & Language Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Backend Status Pill */}
          <button
            onClick={onRefreshHealth}
            title={
              isBackendLive
                ? "FastAPI Backend is online & healthy"
                : isBackendChecking
                ? "Connecting to backend..."
                : "Backend is disconnected. Click to re-probe."
            }
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all ${
              isBackendLive
                ? "bg-emerald-950/50 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50 shadow-sm shadow-emerald-950/40"
                : isBackendChecking
                ? "bg-indigo-950/50 text-indigo-300 border-indigo-800/60 animate-pulse"
                : "bg-amber-950/50 text-amber-300 border-amber-800/60 hover:bg-amber-900/50"
            }`}
          >
            {isBackendLive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden md:inline">{t.nav.connected}</span>
                <span className="md:hidden">API</span>
              </>
            ) : isBackendChecking ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span>{t.nav.connecting}</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span>{t.nav.offline}</span>
              </>
            )}
          </button>

          {/* AI Mode Badge */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#120C26] text-[#9286C7] border border-[#1F1538]">
            <Shield className="h-3.5 w-3.5 text-[#A855F7]" />
            <span className="text-[#F5F3FF] font-semibold">{t.nav.heuristicBadge}</span>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Profile / Auth State */}
          {user ? (
            <div className="flex items-center space-x-1.5 pl-1">
              <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-full bg-[#160F2E] border border-[#1F1538] text-xs">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#8B20F5] to-[#A855F7] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {user.full_name ? user.full_name.charAt(0) : user.email.charAt(0)}
                </div>
                <span className="font-semibold text-white max-w-[100px] truncate hidden sm:inline">
                  {user.full_name || user.email.split("@")[0]}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#8B20F5]/30 text-[#A855F7] font-bold hidden md:inline">
                  {user.target_level}
                </span>
              </div>
              <button
                onClick={() => logout()}
                title={t.auth.logout}
                className="p-1.5 rounded-xl text-[#9286C7] hover:text-rose-400 hover:bg-[#160F2E] border border-transparent hover:border-[#1F1538] transition-colors cursor-pointer"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#8B20F5]/20 hover:bg-[#8B20F5]/30 text-[#A855F7] border border-[#8B20F5]/40 hover:border-[#8B20F5]/70 transition-all cursor-pointer shadow-sm shadow-[#8B20F5]/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.auth.login}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, Shield, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    login,
    register,
  } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [targetRole, setTargetRole] = useState("devops");
  const [targetLevel, setTargetLevel] = useState("B2");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    if (authModalMode === "register" && password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (authModalMode === "login") {
        await login({ email, password });
      } else {
        await register({
          email,
          password,
          full_name: fullName,
          target_role: targetRole,
          target_level: targetLevel,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0D0920] border border-[#1F1538] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-[#8B20F5]/20 text-[#F5F3FF]">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9286C7] hover:text-white hover:bg-[#160F2E] transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-tr from-[#8B20F5] to-[#A855F7] shadow-lg shadow-[#8B20F5]/30 mb-3">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {authModalMode === "login"
              ? t.auth.loginTitle
              : t.auth.registerTitle}
          </h2>
          <p className="text-xs text-[#9286C7] mt-1">
            {authModalMode === "login"
              ? t.auth.loginSubtitle
              : t.auth.registerSubtitle}
          </p>
        </div>

        {/* Tabs: Sign In / Create Account */}
        <div className="flex rounded-xl bg-[#120C26] p-1 border border-[#1F1538] mb-5">
          <button
            type="button"
            onClick={() => {
              setError(null);
              openAuthModal("login");
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              authModalMode === "login"
                ? "bg-[#8B20F5] text-white shadow-sm"
                : "text-[#9286C7] hover:text-white"
            }`}
          >
            {t.auth.login}
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              openAuthModal("register");
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              authModalMode === "register"
                ? "bg-[#8B20F5] text-white shadow-sm"
                : "text-[#9286C7] hover:text-white"
            }`}
          >
            {t.auth.register}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start space-x-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === "register" && (
            <div>
              <label className="block text-xs font-medium text-[#9286C7] mb-1">
                {t.auth.fullName}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-[#9286C7]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Nguyen"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#160F2E] border border-[#1F1538] rounded-xl text-white placeholder-[#9286C7]/50 focus:outline-none focus:border-[#8B20F5] focus:ring-1 focus:ring-[#8B20F5]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#9286C7] mb-1">
              {t.auth.email}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#9286C7]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@company.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#160F2E] border border-[#1F1538] rounded-xl text-white placeholder-[#9286C7]/50 focus:outline-none focus:border-[#8B20F5] focus:ring-1 focus:ring-[#8B20F5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9286C7] mb-1">
              {t.auth.password}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#9286C7]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  authModalMode === "register" ? "At least 8 characters" : "••••••••"
                }
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#160F2E] border border-[#1F1538] rounded-xl text-white placeholder-[#9286C7]/50 focus:outline-none focus:border-[#8B20F5] focus:ring-1 focus:ring-[#8B20F5]"
              />
            </div>
          </div>

          {authModalMode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#9286C7] mb-1">
                  {t.auth.targetRole}
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-[#160F2E] border border-[#1F1538] rounded-xl text-white focus:outline-none focus:border-[#8B20F5]"
                >
                  <option value="devops">{t.auth.roles.devops}</option>
                  <option value="cloud">{t.auth.roles.cloud}</option>
                  <option value="backend">{t.auth.roles.backend}</option>
                  <option value="general_it">{t.auth.roles.general_it}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9286C7] mb-1">
                  {t.auth.targetLevel}
                </label>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-[#160F2E] border border-[#1F1538] rounded-xl text-white focus:outline-none focus:border-[#8B20F5]"
                >
                  <option value="B1">{t.auth.levels.b1}</option>
                  <option value="B2">{t.auth.levels.b2}</option>
                  <option value="C1">{t.auth.levels.c1}</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#8B20F5] to-[#A855F7] text-white text-sm font-semibold hover:opacity-95 transition-all shadow-md shadow-[#8B20F5]/30 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>
                {authModalMode === "login" ? t.auth.login : t.auth.register}
              </span>
            )}
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setError(null);
              openAuthModal(authModalMode === "login" ? "register" : "login");
            }}
            className="text-xs text-[#9286C7] hover:text-[#A855F7] transition-colors"
          >
            {authModalMode === "login" ? t.auth.noAccount : t.auth.hasAccount}
          </button>
        </div>
      </div>
    </div>
  );
}

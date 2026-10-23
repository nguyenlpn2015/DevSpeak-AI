"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t.nav.selectLanguage}
      className="flex items-center rounded-lg bg-slate-900/90 p-0.5 border border-slate-800 text-xs font-semibold shadow-inner"
    >
      <div className="pl-1.5 pr-1 text-slate-400 flex items-center">
        <Globe className="w-3.5 h-3.5" aria-hidden="true" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        data-testid="lang-switch-en"
        className={`px-2 py-0.5 rounded-md transition-all ${
          language === "en"
            ? "bg-brand-600 text-white shadow-sm"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("vi")}
        aria-pressed={language === "vi"}
        data-testid="lang-switch-vi"
        className={`px-2 py-0.5 rounded-md transition-all ${
          language === "vi"
            ? "bg-brand-600 text-white shadow-sm"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="Chuyển sang Tiếng Việt"
      >
        VI
      </button>
    </div>
  );
}


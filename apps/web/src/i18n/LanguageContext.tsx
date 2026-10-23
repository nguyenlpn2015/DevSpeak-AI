"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Locale, Translations } from "./types";
import { en } from "./en";
import { vi } from "./vi";

interface LanguageContextValue {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const STORAGE_KEY = "devspeak_locale";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Locale>("en");

  // Load saved preference from localStorage on mount (hydration-safe)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "vi") {
        setLanguageState(saved);
      }
    } catch {
      // Ignore localStorage access failures (e.g. private browsing)
    }
  }, []);

  const setLanguage = (lang: Locale) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "vi" : "en");
  };

  const t = useMemo(() => (language === "vi" ? vi : en), [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback for components rendered outside LanguageProvider
    return {
      language: "en",
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: en,
    };
  }
  return context;
}


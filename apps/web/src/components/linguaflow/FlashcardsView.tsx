"use client";

import React, { useState } from "react";
import {
  RotateCw,
  CheckCircle2,
  XCircle,
  Volume2,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Flashcard {
  id: string;
  term: string;
  phonetic: string;
  category: string;
  definition: string;
  example: string;
  tip: string;
}

const DEVSPEAK_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-1",
    term: "CrashLoopBackOff",
    phonetic: "/kræʃ luːp bæk ɔːf/",
    category: "Kubernetes Core",
    definition:
      "A pod state indicating that a container repeatedly crashes right after starting, so kubelet exponentially backs off before restarting it.",
    example:
      "The microservice was stuck in a CrashLoopBackOff due to a missing database credential in the Secret.",
    tip: "Use 'inspect previous logs with kubectl logs --previous' to sound like a senior SRE.",
  },
  {
    id: "fc-2",
    term: "OOMKilled (Exit Code 137)",
    phonetic: "/oʊ oʊ ɛm kɪld/",
    category: "Linux / Cgroups",
    definition:
      "Out-Of-Memory Killer. The Linux kernel kills the container process because it consumed more RAM than its configured cgroup limit.",
    example:
      "The exit code 137 confirmed the JVM exceeded its 2GB limit and was OOMKilled by the node kernel.",
    tip: "Mention that Exit Code 137 equals 128 + 9 (SIGKILL).",
  },
  {
    id: "fc-3",
    term: "Canary Release",
    phonetic: "/kəˈnɛəri rɪˈliːs/",
    category: "CI/CD & Delivery",
    definition:
      "A deployment strategy where new code is rolled out to a tiny percentage of live traffic to observe error budgets and latency before full rollout.",
    example:
      "We routed 5% of ingress traffic to the canary replica and monitored HTTP 5xx spikes.",
    tip: "Pair with 'automated rollback' and 'error budget'.",
  },
  {
    id: "fc-4",
    term: "SLO Threshold",
    phonetic: "/ɛs ɛl oʊ ˈθrɛʃhoʊld/",
    category: "Site Reliability",
    definition:
      "Service Level Objective boundary. Defines the agreed target reliability and latency metric for users.",
    example:
      "When the 99th percentile response time breached our SLO threshold, the deployment automatically rolled back.",
    tip: "Highlight 'p99 latency' and 'error budget consumption'.",
  },
  {
    id: "fc-5",
    term: "Multi-Stage Build",
    phonetic: "/ˈmʌlti steɪdʒ bɪld/",
    category: "Docker & Security",
    definition:
      "A Dockerfile pattern using multiple FROM instructions to isolate compilation tools and copy only lean artifacts into the final runtime image.",
    example:
      "Our multi-stage Docker build dropped the final image size from 1.2GB to 45MB while stripping out GCC.",
    tip: "Emphasize 'attack surface reduction' and 'non-root user'.",
  },
  {
    id: "fc-6",
    term: "iowait",
    phonetic: "/aɪ oʊ weɪt/",
    category: "Linux Performance",
    definition:
      "Percentage of time the CPU was idle while an outstanding disk I/O request was in flight.",
    example:
      "A sustained 60% iowait indicated our PostgreSQL EBS volume had run out of burst IOPS.",
    tip: "Mention 'vmstat 1' and 'iostat -xz 1' as primary diagnostic tools.",
  },
];

interface FlashcardsViewProps {
  onBack: () => void;
  onPracticeInStudio?: (term: string) => void;
}

export function FlashcardsView({
  onBack,
  onPracticeInStudio,
}: FlashcardsViewProps) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  const currentCard = DEVSPEAK_FLASHCARDS[currentIndex];
  const isMastered = masteredIds.has(currentCard.id);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % DEVSPEAK_FLASHCARDS.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(
      (prev) => (prev - 1 + DEVSPEAK_FLASHCARDS.length) % DEVSPEAK_FLASHCARDS.length
    );
  };

  const toggleMastered = () => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentCard.id)) {
        next.delete(currentCard.id);
      } else {
        next.add(currentCard.id);
      }
      return next;
    });
  };

  const playPronunciation = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentCard.term);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center text-xs font-semibold text-[#9286C7] hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-[#0D0920] border border-[#1F1538] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t.practice.backBtn}
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[#9286C7]">
            Card {currentIndex + 1} of {DEVSPEAK_FLASHCARDS.length}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8B20F5]/20 text-[#A855F7] border border-[#8B20F5]/30">
            {masteredIds.size} Mastered
          </span>
        </div>
      </div>

      {/* Main Flashcard Container with 3D Flip */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[320px] rounded-3xl bg-gradient-to-br from-[#0D0920] via-[#120C26] to-[#0D0920] border border-[#2D1E4E] hover:border-[#8B20F5]/50 transition-all duration-300 p-8 shadow-2xl shadow-[#8B20F5]/10 flex flex-col justify-between cursor-pointer select-none relative group"
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#8B20F5]/20 text-[#A855F7] border border-[#8B20F5]/30">
            {currentCard.category}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                playPronunciation();
              }}
              title="Pronounce term"
              className="p-2 rounded-xl bg-[#160F2E] hover:bg-[#8B20F5]/20 text-[#A855F7] transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#9286C7] flex items-center gap-1 group-hover:text-white">
              <RotateCw className="w-3.5 h-3.5" />
              Flip
            </span>
          </div>
        </div>

        {/* Center Content: Term vs Definition */}
        <div className="py-8 text-center space-y-4">
          {!isFlipped ? (
            <>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {currentCard.term}
              </h2>
              <p className="text-sm text-[#A855F7] font-mono">
                {currentCard.phonetic}
              </p>
              <p className="text-xs text-[#9286C7] max-w-md mx-auto">
                Click anywhere to flip and see the senior technical definition, IT example, and interview tips.
              </p>
            </>
          ) : (
            <div className="space-y-4 text-left animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A855F7]">
                  Definition
                </span>
                <p className="text-sm sm:text-base text-white leading-relaxed font-sans mt-0.5">
                  {currentCard.definition}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#160F2E] border border-[#2D1E4E]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A00]">
                  Interview Usage Example
                </span>
                <p className="text-xs text-white/90 italic mt-0.5 leading-relaxed">
                  &ldquo;{currentCard.example}&rdquo;
                </p>
              </div>

              <div className="text-xs text-[#009F83] flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tip: {currentCard.tip}</span>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1F1538]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMastered();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              isMastered
                ? "bg-[#009F83]/20 text-[#00D6B1] border border-[#009F83]/40"
                : "bg-[#160F2E] text-[#9286C7] hover:text-white"
            }`}
          >
            {isMastered ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#00D6B1]" />
                <span>Mastered</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-[#9286C7]" />
                <span>Mark as Mastered</span>
              </>
            )}
          </button>

          {onPracticeInStudio && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPracticeInStudio(currentCard.term);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#8B20F5] hover:bg-[#A855F7] text-white text-xs font-bold shadow-md shadow-[#8B20F5]/30 transition-all"
            >
              Practice in Studio
            </button>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handlePrev}
          className="p-3 rounded-2xl bg-[#0D0920] border border-[#1F1538] hover:border-[#8B20F5]/50 text-white transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold text-[#9286C7]">
          {currentIndex + 1} / {DEVSPEAK_FLASHCARDS.length}
        </span>
        <button
          onClick={handleNext}
          className="p-3 rounded-2xl bg-[#0D0920] border border-[#1F1538] hover:border-[#8B20F5]/50 text-white transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}


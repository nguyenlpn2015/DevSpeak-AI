"use client";

import React, { useState } from "react";
import { Copy, Check, Plus, BookOpen, Layers, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface VocabularyCoachProps {
  keyConcepts: string[];
  competencies: string[];
  onInsertTerm: (term: string) => void;
}

interface TermDetail {
  category: string;
  explanation: string;
  collocation: string;
}

// Curated technical linguistic insights mapped to rubric terms
const VOCABULARY_INSIGHTS: Record<string, TermDetail> = {
  "kubectl describe pod": {
    category: "Kubernetes CLI",
    explanation: "Inspects detailed pod metadata, state transitions, recent events, and container exit codes.",
    collocation: "First, I run kubectl describe pod to inspect the termination state and recent cluster events.",
  },
  "kubectl logs --previous": {
    category: "Kubernetes CLI",
    explanation: "Retrieves stdout/stderr stream from the previous terminated instance of a crashed container.",
    collocation: "I execute kubectl logs --previous to capture the fatal stack trace prior to container crash.",
  },
  "OOMKilled (Exit Code 137)": {
    category: "Container Lifecycle",
    explanation: "Occurs when the Linux cgroup memory limit is exceeded, triggering SIGKILL (128 + 9 = 137).",
    collocation: "An exit code 137 confirms the kernel invoked OOMKilled because memory limits were saturated.",
  },
  "liveness probe": {
    category: "Health Checks",
    explanation: "Determines if the container needs to be restarted; misconfigured probe delays trigger false CrashLoops.",
    collocation: "I verify whether the liveness probe failure threshold or timeout duration is too aggressive.",
  },
  "configmap/secret missing": {
    category: "Configuration",
    explanation: "Missing environment variables or mounted volume mounts causing the entrypoint script to fail early.",
    collocation: "I check if required ConfigMaps or Secrets are unbound, preventing application bootstrap.",
  },
  "exit code": {
    category: "Process Lifecycle",
    explanation: "The integer returned by the process upon termination (0 for success, 137 for OOM, 1 for runtime error).",
    collocation: "Inspecting the exit code indicates whether the failure was an application exception or an OS signal.",
  },
  "Canary release": {
    category: "Progressive Delivery",
    explanation: "Routing a small fraction of real production traffic to a new deployment to measure error rates before full rollout.",
    collocation: "We initiate the canary release by shifting 5% of ingress traffic to the new revision.",
  },
  "SLO threshold": {
    category: "Site Reliability",
    explanation: "Service Level Objective target defining the acceptable latency and HTTP error budget.",
    collocation: "When 5xx error rates breach our SLO threshold, the deployment controller triggers an automated rollback.",
  },
  "Automated rollback": {
    category: "Continuous Delivery",
    explanation: "Reverting ingress traffic to the stable revision immediately without human intervention.",
    collocation: "Our pipeline executes an automated zero-downtime rollback to protect user experience.",
  },
  "NAT Gateway": {
    category: "Cloud Networking",
    explanation: "Managed AWS VPC service enabling outbound internet access for private subnets while preventing inbound connections.",
    collocation: "Deploying a single NAT Gateway across AZs introduces cross-AZ data transfer costs and a single point of failure.",
  },
  "VPC Peering": {
    category: "Cloud Networking",
    explanation: "Direct network connection between two VPCs routing traffic via private IPv4 or IPv6 addresses without an internet gateway.",
    collocation: "We establish VPC Peering for predictable, low-latency inter-VPC traffic at lower cost than transit gateways.",
  },
  "iowait": {
    category: "Linux Kernel / SRE",
    explanation: "Percentage of CPU time spent waiting for an outstanding disk I/O request while runnable processes exist.",
    collocation: "High iowait indicates storage subsystem saturation rather than an unoptimized compute loop.",
  },
  "vmstat": {
    category: "Linux CLI Profiling",
    explanation: "Reports virtual memory, processes, block I/O, paging, and CPU activity in real-time.",
    collocation: "Running vmstat 1 reveals whether the system is memory starved or bottlenecked on disk wait.",
  },
  "STAR Method": {
    category: "Behavioral Delivery",
    explanation: "Situation, Task, Action, Result — the benchmark communication structure for senior engineering interviews.",
    collocation: "Structuring my incident story with STAR highlights both technical execution and business impact.",
  },
  "Multi-stage build": {
    category: "Docker & Container Security",
    explanation: "Using multiple FROM instructions in a Dockerfile to separate the build environment from the final lean runtime.",
    collocation: "Multi-stage builds eliminate compiler toolchains from production images, minimizing the CVE attack surface.",
  },
};

export function VocabularyCoach({
  keyConcepts,
  competencies,
  onInsertTerm,
}: VocabularyCoachProps) {
  const { t } = useLanguage();
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  const handleCopy = (term: string) => {
    navigator.clipboard.writeText(term);
    setCopiedTerm(term);
    setTimeout(() => setCopiedTerm(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-brand-400" />
          {t.studio.vocabulary.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {t.studio.vocabulary.subtitle}
        </p>
      </div>

      {/* Competencies Tags */}
      {competencies.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400">
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            <span>Target Competencies:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {competencies.map((comp, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-900 text-slate-300 border border-slate-800"
              >
                {comp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Vocabulary Cards */}
      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 focus:outline-none">
        {keyConcepts.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            {t.studio.vocabulary.emptyText}
          </p>
        ) : (
          keyConcepts.map((term, idx) => {
            const detail = VOCABULARY_INSIGHTS[term] || {
              category: "Key Rubric Concept",
              explanation: "Required technical term evaluated by hiring committee for this topic.",
              collocation: `In our architecture, we verify ${term} systematically.`,
            };

            const isCopied = copiedTerm === term;

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/80 hover:border-brand-500/40 transition-all space-y-2 group"
              >
                {/* Term title & category */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-brand-300 bg-brand-950/60 px-2 py-0.5 rounded border border-brand-800/50">
                    {term}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 shrink-0">
                    {detail.category}
                  </span>
                </div>

                {/* Explanation */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {detail.explanation}
                </p>

                {/* Example sentence */}
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60 text-[11px] text-slate-400 italic">
                  &ldquo;{detail.collocation}&rdquo;
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => handleCopy(term)}
                    className="px-2 py-1 rounded text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors inline-flex items-center cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-emerald-400" />
                        {t.studio.vocabulary.copiedTerm}
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        {t.studio.vocabulary.copyTerm}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onInsertTerm(term)}
                    className="px-2 py-1 rounded text-[11px] font-medium bg-brand-950/80 hover:bg-brand-900 text-brand-300 hover:text-white border border-brand-800/50 transition-colors inline-flex items-center cursor-pointer"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {t.studio.vocabulary.insertTerm}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Honest Source Badge */}
      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-850 flex items-start space-x-2 text-[10px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-tight">{t.studio.vocabulary.rubricSource}</p>
      </div>
    </div>
  );
}


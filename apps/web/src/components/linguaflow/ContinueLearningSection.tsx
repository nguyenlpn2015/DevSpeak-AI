"use client";

import React from "react";
import {
  Layers,
  Mic,
  Bot,
  Sparkles,
  ChevronRight,
  Headphones,
  Code2,
  BookOpen,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface ContinueLearningProps {
  onSelectAction: (
    action: "flashcards" | "shadowing" | "studio" | "exercises"
  ) => void;
}

export function ContinueLearningSection({
  onSelectAction,
}: ContinueLearningProps) {
  const { t } = useLanguage();

  const cards = [
    {
      id: "flashcards" as const,
      title: t.flowDashboard.continueLearning.cardReview.title,
      desc: t.flowDashboard.continueLearning.cardReview.desc,
      tag: "12 Thẻ hôm nay",
      icon: <Layers className="w-5 h-5 text-white" />,
      bgGradient: "from-[#8B20F5] to-[#6010B8]",
      shadow: "shadow-[#8B20F5]/25 hover:shadow-[#8B20F5]/50",
      border: "border-[#A855F7]/30",
    },
    {
      id: "shadowing" as const,
      title: t.flowDashboard.continueLearning.cardShadow.title,
      desc: t.flowDashboard.continueLearning.cardShadow.desc,
      tag: "Luyện phát âm & Ngữ điệu",
      icon: <Mic className="w-5 h-5 text-white" />,
      bgGradient: "from-[#EC007A] to-[#B8005F]",
      shadow: "shadow-[#EC007A]/25 hover:shadow-[#EC007A]/50",
      border: "border-[#FF4D9E]/30",
    },
    {
      id: "studio" as const,
      title: t.flowDashboard.continueLearning.cardAI.title,
      desc: t.flowDashboard.continueLearning.cardAI.desc,
      tag: "AI Coach 1-1 Thực chiến",
      icon: <Bot className="w-5 h-5 text-white" />,
      bgGradient: "from-[#315BFF] to-[#1A3EC7]",
      shadow: "shadow-[#315BFF]/25 hover:shadow-[#315BFF]/50",
      border: "border-[#6085FF]/30",
    },
    {
      id: "exercises" as const,
      title: t.flowDashboard.continueLearning.cardExercises.title,
      desc: t.flowDashboard.continueLearning.cardExercises.desc,
      tag: "STAR Framework",
      icon: <Code2 className="w-5 h-5 text-white" />,
      bgGradient: "from-[#009F83] to-[#00705C]",
      shadow: "shadow-[#009F83]/25 hover:shadow-[#009F83]/50",
      border: "border-[#00D6B1]/30",
    },
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <span>{t.flowDashboard.continueLearning.heading}</span>
          <span className="text-xs font-normal text-[#9286C7]">
            (4 Phương pháp học tương tác)
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelectAction(card.id)}
            className={`p-5 rounded-2xl bg-gradient-to-br ${card.bgGradient} border ${card.border} text-left text-white transition-all duration-300 transform hover:-translate-y-1.5 shadow-lg ${card.shadow} flex flex-col justify-between space-y-4 cursor-pointer group`}
          >
            {/* Card Header: Icon Badge + Micro Tag */}
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform">
                {card.icon}
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/25 text-white/90 backdrop-blur-sm border border-white/10">
                {card.tag}
              </span>
            </div>

            {/* Card Body */}
            <div className="space-y-1.5">
              <h3 className="font-bold text-base tracking-tight group-hover:translate-x-0.5 transition-transform">
                {card.title}
              </h3>
              <p className="text-xs text-white/85 font-medium leading-relaxed">
                {card.desc}
              </p>
            </div>

            {/* Card Footer: Action Indicator */}
            <div className="flex items-center text-xs font-semibold text-white/95 pt-2 border-t border-white/15">
              <span>Bắt đầu ngay</span>
              <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { addGuideHistory, getGuideHistory, GuideHistoryItem } from "@/lib/history";
import { useLanguage } from "@/lib/LanguageContext";
import { RoadmapGuideResult } from "@/lib/gemini";
import { Search, Loader2, Compass, Bookmark } from "lucide-react";

// Translation dictionary for Guide Page UI
const TRANSLATIONS: Record<string, any> = {
  EN: {
    guideHeader: "AI Guide & Roadmaps",
    placeholder: 'Ask Bridged (e.g., "What is Jeonip-singgo?")',
    generating: "Generating Roadmap...",
    generatingDesc: "Analyzing Korean legal rules & designing checklist steps",
    solutionHeader: "BridgeAI Solution",
    tipsHeader: "Additional Tips",
    savedGuides: "Saved Guides & Q&As"
  },
  KO: {
    guideHeader: "AI 생활 가이드 및 로드맵",
    placeholder: '무엇이든 물어보세요 (예: "전입신고는 어떻게 하나요?")',
    generating: "로드맵 생성 중...",
    generatingDesc: "한국 관련 행정 규정을 분석하여 절차 체크리스트를 그리는 중입니다.",
    solutionHeader: "BridgeAI 안내 솔루션",
    tipsHeader: "추가 정보 및 꿀팁",
    savedGuides: "저장된 가이드 이력"
  },
  ZH: {
    guideHeader: "AI 生活指南和路线图",
    placeholder: '向 Bridged 提问 (例如："什么是迁入申报？")',
    generating: "正在生成路线图...",
    generatingDesc: "正在分析韩国法律法规并设计步骤清单",
    solutionHeader: "BridgeAI 解决方案",
    tipsHeader: "其他提示/建议",
    savedGuides: "已保存的指南与问答"
  },
  VI: {
    guideHeader: "Hướng dẫn & Lộ trình AI",
    placeholder: 'Hỏi Bridged (Ví dụ: "Khai báo tạm trú là gì?")',
    generating: "Đang tạo lộ trình...",
    generatingDesc: "Đang phân tích các quy định pháp lý Hàn Quốc & lập danh sách các bước",
    solutionHeader: "Giải pháp BridgeAI",
    tipsHeader: "Lời khuyên bổ sung",
    savedGuides: "Lịch sử hướng dẫn đã lưu"
  },
  JA: {
    guideHeader: "AI生活ガイド＆ロードマップ",
    placeholder: '何でも質問してください (例:「転入届はどう出しますか？」)',
    generating: "ロードマップ生成中...",
    generatingDesc: "韓国の行政規則を分析し、チェックリスト手順を設計中...",
    solutionHeader: "BridgeAI ガイドソリューション",
    tipsHeader: "追加情報と豆知識",
    savedGuides: "保存されたガイド履歴"
  }
};

function GuideContent() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("General");
  const [roadmap, setRoadmap] = useState<RoadmapGuideResult | null>(null);
  const [history, setHistory] = useState<GuideHistoryItem[]>([]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.EN;

  // Load history on mount
  useEffect(() => {
    setHistory(getGuideHistory());
  }, []);

  // Listen for Quick Category clicks coming from Home (via URL query params)
  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("cat");
    if (q) {
      setQuery(q);
      if (cat) {
        setCategory(cat);
      }
      // Delay search slightly to ensure lang is correctly loaded from context
      const timer = setTimeout(() => {
        triggerGuideSearch(q, cat || "General");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    triggerGuideSearch(query, category);
  };

  const triggerGuideSearch = async (questionText: string, categoryName: string) => {
    setLoading(true);
    setRoadmap(null);

    try {
      const response = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          category: categoryName,
          lang: lang
        })
      });

      if (!response.ok) {
        throw new Error("Guide request failed");
      }

      const data: RoadmapGuideResult = await response.json();
      setRoadmap(data);

      // Save to local storage history
      const savedItem = addGuideHistory(questionText, categoryName, data);
      setHistory(prev => [savedItem, ...prev]);
    } catch (error) {
      console.error("Failed to generate guide:", error);
      alert("Error occurred while generating the guide. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: GuideHistoryItem) => {
    setQuery(item.question);
    setCategory(item.category);
    setRoadmap(item.result);
  };

  return (
    <div className="p-5 flex flex-col gap-6 animate-fade-in-up">
      <h2 className="font-bold text-[16px] text-gray-800 flex items-center gap-2">
        <span>💡</span> {t.guideHeader}
      </h2>

      {/* Query Search Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.placeholder}
            className="w-full bg-white border-2 border-gray-200 focus:border-[#4f46e5] rounded-2xl py-4 pl-5 pr-12 text-[14px] font-medium outline-none shadow-sm transition"
          />
          <button
            type="submit"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4f46e5] transition p-1"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Loading Spinner */}
      {loading && (
        <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center gap-4 shadow-sm border border-gray-100 min-h-[300px]">
          <Loader2 className="w-10 h-10 text-[#4f46e5] animate-spin" />
          <div className="text-center">
            <p className="font-bold text-gray-800 text-[15px]">{t.generating}</p>
            <p className="text-gray-400 text-[12px] mt-1">{t.generatingDesc}</p>
          </div>
        </div>
      )}

      {/* Guide Solution Roadmap (Figma 4 Spec) */}
      {roadmap && !loading && (
        <div className="flex flex-col gap-5 animate-fade-in-up">
          {/* Main Roadmap Card */}
          <div className="bg-white rounded-[18px] border border-gray-100 shadow-sm p-5 relative overflow-hidden flex flex-col">
            
            {/* Header / Meta */}
            <div className="flex flex-col gap-1 pb-4 border-b border-gray-50">
              <h3 className="font-bold text-[16px] text-gray-800 flex items-center gap-1.5 leading-tight">
                🤖 {t.solutionHeader}
              </h3>
              <p className="text-[#6b7280] text-[13px] font-medium mt-1 leading-snug">
                {roadmap.title}
              </p>
            </div>

            {/* Timeline UI (Matching Figma Left-Bar design) */}
            <div className="relative pl-7 mt-5 flex flex-col gap-6">
              {/* Vertically drawn timeline line */}
              <div className="absolute left-[7px] top-[10px] bottom-[30px] w-[2px] bg-indigo-100 rounded-full" />

              {roadmap.steps.map((stepItem, idx) => (
                <div key={idx} className="relative flex flex-col gap-1.5">
                  {/* Circle dot on the line */}
                  <div className="absolute -left-[27px] top-[6px] w-[14px] h-[14px] bg-[#4f46e5] rounded-full border-2 border-white ring-4 ring-indigo-50/50 flex items-center justify-center text-[8px] font-bold text-white z-10" />
                  
                  {/* Step Title */}
                  <h4 className="font-bold text-[14px] text-gray-800 leading-tight">
                    {stepItem.title}
                  </h4>
                  {/* Step Content */}
                  <p className="text-[#6b7280] text-[13px] leading-relaxed font-medium">
                    {stepItem.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Tips Card */}
          {roadmap.additionalTips && roadmap.additionalTips.length > 0 && (
            <div className="bg-indigo-50/40 rounded-[18px] p-5 shadow-sm border border-indigo-50 flex flex-col gap-3">
              <h4 className="font-bold text-[14px] text-indigo-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#4f46e5]" /> {t.tipsHeader}
              </h4>
              
              <ul className="flex flex-col gap-2.5">
                {roadmap.additionalTips.map((tip, index) => (
                  <li key={index} className="text-[13px] text-indigo-950 font-medium leading-snug flex items-start gap-2">
                    <span className="text-[#4f46e5] text-[15px] leading-none shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* History section (Only show if history exists and not loading) */}
      {!loading && history.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          <h3 className="font-bold text-[14px] text-gray-500 flex items-center gap-1.5 border-t border-gray-200 pt-5">
            <Bookmark className="w-4 h-4" /> {t.savedGuides}
          </h3>
          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectHistoryItem(item)}
                className={`cursor-pointer p-3 rounded-xl border flex justify-between items-center bg-white transition hover:border-indigo-100 ${
                  roadmap?.title === item.result.title
                    ? "border-[#4f46e5] bg-indigo-50/20"
                    : "border-gray-100"
                }`}
              >
                <div className="flex gap-2.5 items-center overflow-hidden">
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-[13px] text-gray-800 truncate leading-none mb-1">
                      {item.question}
                    </span>
                    <span className="text-gray-400 text-[10px] truncate leading-none">
                      {item.date}
                    </span>
                  </div>
                </div>
                <span className="bg-indigo-50 text-[#4f46e5] text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={
      <div className="p-5 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-[#4f46e5] animate-spin" />
      </div>
    }>
      <GuideContent />
    </Suspense>
  );
}

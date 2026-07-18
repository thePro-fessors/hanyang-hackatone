"use client";

import React, { useState, useEffect, useRef } from "react";
import { addScanHistory, getScanHistory, ScanHistoryItem } from "@/lib/history";
import { useLanguage } from "@/lib/LanguageContext";
import { DocumentAnalysisResult } from "@/lib/gemini";
import { Upload, Camera, AlertTriangle, Eye, Loader2, FileText, CheckCircle2, History } from "lucide-react";

// Multi-language translation dictionary for Scan Page UI
const TRANSLATIONS: Record<string, any> = {
  EN: {
    reportHeader: "Document Analysis Report",
    uploadHeader: "Upload Bill / Document",
    supportFiles: "Supports PNG, JPG, WebP",
    scanCamera: "Scan with Camera",
    analyzing: "Analyzing Document...",
    analyzingDesc: "Gemini AI is reading OCR & translating legal texts",
    dDayLeft: "Left",
    clear: "Clear",
    docExplain: "This document is a",
    originalText: "Original",
    payExplainPre: "You need to pay",
    payExplainMid: "by",
    actionHeader: "Action Items (What to do)",
    comparePhoto: "Compare with Original Photo",
    scanHistory: "Scan History",
    origPhoto: "Original Document Photo",
    close: "Close"
  },
  KO: {
    reportHeader: "문서 분석 보고서",
    uploadHeader: "문서 / 고지서 업로드",
    supportFiles: "PNG, JPG, WebP 지원",
    scanCamera: "카메라로 스캔",
    analyzing: "문서 분석 중...",
    analyzingDesc: "Gemini AI가 고지서 OCR 판독 및 번역 중입니다.",
    dDayLeft: "남음",
    clear: "초기화",
    docExplain: "이 문서는",
    originalText: "원문",
    payExplainPre: "납부하실 금액은",
    payExplainMid: "이며, 납부 기한은",
    actionHeader: "조치 및 해결 순서",
    comparePhoto: "원본 사진 대조",
    scanHistory: "스캔 이력",
    origPhoto: "원본 문서 사진",
    close: "닫기"
  },
  ZH: {
    reportHeader: "文档分析报告",
    uploadHeader: "上传文档 / 账单",
    supportFiles: "支持 PNG, JPG, WebP",
    scanCamera: "用相机扫描",
    analyzing: "正在分析文档...",
    analyzingDesc: "Gemini AI 正在读取 OCR 并翻译法律文本",
    dDayLeft: "剩余",
    clear: "清除",
    docExplain: "此文档为",
    originalText: "原文",
    payExplainPre: "您需要支付",
    payExplainMid: "，截止日期为",
    actionHeader: "行动指南 (需采取的步骤)",
    comparePhoto: "与原始照片对比",
    scanHistory: "扫描历史",
    origPhoto: "原始文档照片",
    close: "关闭"
  },
  VI: {
    reportHeader: "Báo cáo phân tích tài liệu",
    uploadHeader: "Tải lên ảnh tài liệu / hóa đơn",
    supportFiles: "Hỗ trợ PNG, JPG, WebP",
    scanCamera: "Quét bằng Camera",
    analyzing: "Đang phân tích tài liệu...",
    analyzingDesc: "Gemini AI đang đọc OCR & dịch văn bản pháp lý",
    dDayLeft: "còn lại",
    clear: "Xóa",
    docExplain: "Tài liệu này là",
    originalText: "Nguyên bản",
    payExplainPre: "Bạn cần thanh toán",
    payExplainMid: "hạn chót là ngày",
    actionHeader: "Hành động cần làm",
    comparePhoto: "So sánh với ảnh gốc",
    scanHistory: "Lịch sử quét",
    origPhoto: "Ảnh tài liệu gốc",
    close: "Đóng"
  },
  JA: {
    reportHeader: "文書分析レポート",
    uploadHeader: "文書 / 請求書のアップロード",
    supportFiles: "PNG, JPG, WebP サポート",
    scanCamera: "カメラでスキャン",
    analyzing: "文書分析中...",
    analyzingDesc: "Gemini AIが請求書OCR判読および翻訳中...",
    dDayLeft: "残り",
    clear: "クリア",
    docExplain: "この文書は",
    originalText: "原文",
    payExplainPre: "お支払金額は",
    payExplainMid: "で、期限は",
    actionHeader: "必要な対応手順",
    comparePhoto: "原本写真と対比する",
    scanHistory: "スキャン履歴",
    origPhoto: "原文書の写真",
    close: "閉じる"
  }
};

export default function ScanPage() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [analysis, setAnalysis] = useState<DocumentAnalysisResult | null>(null);
  const [showOriginalModal, setShowOriginalModal] = useState(false);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.EN;

  // Load local history
  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  // Handle Image Upload & Convert to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImage(base64String);
      analyzeImage(base64String, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Img: string, type: string) => {
    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Img,
          mimeType: type,
          lang: lang
        })
      });

      if (!response.ok) {
        throw new Error("Analysis request failed");
      }

      const data: DocumentAnalysisResult = await response.json();
      setAnalysis(data);

      // Save to local storage history
      const savedItem = addScanHistory(base64Img, data);
      setHistory(prev => [savedItem, ...prev]);
    } catch (error) {
      console.error("Failed to analyze image:", error);
      alert("Error occurred during document analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: ScanHistoryItem) => {
    setImage(item.originalImage);
    setAnalysis(item.result);
  };

  const clearCurrent = () => {
    setImage(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-5 flex flex-col gap-6 animate-fade-in-up">
      <h2 className="font-bold text-[16px] text-gray-800 flex items-center gap-2">
        <span>📋</span> {t.reportHeader}
      </h2>

      {/* Upload/Camera Screen (If no image is uploaded and not loading) */}
      {!image && !loading && (
        <div className="flex flex-col gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#4f46e5] bg-white rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition group"
          >
            <div className="p-4 bg-indigo-50 text-[#4f46e5] rounded-full group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800 text-[15px]">{t.uploadHeader}</p>
              <p className="text-gray-400 text-[12px] mt-1">{t.supportFiles}</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <button
            onClick={() => {
              const input = fileInputRef.current;
              if (input) {
                input.setAttribute("capture", "environment");
                input.click();
              }
            }}
            className="flex items-center justify-center gap-2 bg-[#4f46e5] text-white py-4 rounded-2xl font-bold shadow-md hover:bg-[#4338ca] active:bg-[#3730a3] transition"
          >
            <Camera className="w-5 h-5" />
            <span>{t.scanCamera}</span>
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center gap-4 shadow-sm border border-gray-100 min-h-[300px]">
          <Loader2 className="w-10 h-10 text-[#4f46e5] animate-spin" />
          <div className="text-center">
            <p className="font-bold text-gray-800 text-[15px]">{t.analyzing}</p>
            <p className="text-gray-400 text-[12px] mt-1">{t.analyzingDesc}</p>
          </div>
        </div>
      )}

      {/* Analysis Result Display */}
      {image && analysis && !loading && (
        <div className="flex flex-col gap-5 animate-fade-in-up">
          {/* Card 1: Document Overview */}
          <div className="bg-white rounded-[18px] p-5 shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden">
            {/* D-Day badge */}
            <div className="flex justify-between items-start">
              <span className="bg-red-500 text-white text-[12px] font-bold px-2 py-1 rounded-[6px]">
                D-{analysis.dDay} {t.dDayLeft}
              </span>
              <button 
                onClick={clearCurrent}
                className="text-gray-400 hover:text-gray-600 text-[13px] font-semibold"
              >
                {t.clear}
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-[17px] text-gray-800 leading-tight">
                {lang === "KO" || lang === "JA" ? (
                  <span>이 문서는 <span className="text-[#4f46e5] underline decoration-solid">{analysis.documentType}</span> 입니다.</span>
                ) : (
                  <span>{t.docExplain} <span className="text-[#4f46e5] underline decoration-solid">{analysis.documentType}</span>.</span>
                )}
              </h3>
              <p className="text-[#6b7280] text-[11px] font-medium font-poppins">
                ({t.originalText}: {analysis.documentTypeKo})
              </p>
            </div>

            {analysis.amount && (
              <div className="text-[17px] font-bold text-gray-800 border-t border-gray-50 pt-3">
                {lang === "KO" || lang === "JA" ? (
                  <span>{t.payExplainPre} <span className="font-extrabold text-[#4f46e5]">{analysis.amount}</span>{t.payExplainMid} <span className="font-extrabold">{analysis.deadline}</span>입니다.</span>
                ) : (
                  <span>{t.payExplainPre} <span className="font-extrabold text-[#4f46e5]">{analysis.amount}</span> {t.payExplainMid} <span className="font-extrabold">{analysis.deadline}</span>.</span>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Action Items */}
          <div className="bg-white rounded-[18px] p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
            <h4 className="font-bold text-[15px] text-[#4f46e5] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t.actionHeader}
            </h4>
            
            <div className="flex flex-col gap-4">
              {analysis.actionItems.map((item, index) => (
                <div key={index} className="flex gap-3 items-start border-b border-dashed border-gray-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="bg-[#eef2f6] text-[#4f46e5] font-extrabold text-[13px] w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-[14px] text-gray-700 font-medium leading-tight">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Warning & Compare Button */}
          <div className="flex flex-col gap-3">
            {/* Warning block */}
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-[13px] text-red-800">{analysis.warningTitle}</span>
                <span className="text-[12px] text-red-700 font-medium leading-tight">{analysis.warningContent}</span>
              </div>
            </div>

            {/* Compare Button */}
            <button
              onClick={() => setShowOriginalModal(true)}
              className="w-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition py-3.5 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>{t.comparePhoto}</span>
            </button>
          </div>
        </div>
      )}

      {/* History section (Only show if history exists and not loading) */}
      {!loading && history.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          <h3 className="font-bold text-[14px] text-gray-500 flex items-center gap-1.5 border-t border-gray-200 pt-5">
            <History className="w-4 h-4" /> {t.scanHistory}
          </h3>
          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectHistoryItem(item)}
                className={`cursor-pointer p-3 rounded-xl border flex justify-between items-center bg-white transition hover:border-indigo-100 ${
                  analysis?.documentTypeKo === item.result.documentTypeKo && image === item.originalImage
                    ? "border-[#4f46e5] bg-indigo-50/20"
                    : "border-gray-100"
                }`}
              >
                <div className="flex gap-2.5 items-center overflow-hidden">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {item.originalImage ? (
                      <img src={item.originalImage} alt="bill" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-5 h-5 text-[#4f46e5]" />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-[13px] text-gray-800 truncate leading-none mb-1">
                      {item.result.documentType}
                    </span>
                    <span className="text-gray-400 text-[10px] truncate leading-none">
                      {item.date}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-1">
                  {item.result.amount && (
                    <span className="font-extrabold text-[12px] text-indigo-600">
                      {item.result.amount}
                    </span>
                  )}
                  <span className="bg-red-50 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    D-{item.result.dDay}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showOriginalModal && image && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-[340px] max-h-[700px] overflow-hidden flex flex-col shadow-2xl relative">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <span className="font-bold text-[14px] text-gray-800">{t.origPhoto}</span>
              <button
                onClick={() => setShowOriginalModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-[13px]"
              >
                {t.close}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-gray-50">
              <img src={image} alt="Original Scan" className="max-w-full max-h-[480px] rounded-lg shadow-sm object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

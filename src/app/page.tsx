"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { ArrowRight } from "lucide-react";

// Translation Dictionary for Home Screen
const TRANSLATIONS: Record<string, any> = {
  EN: {
    welcome1: "Welcome!",
    welcome2: "Ask anything about Korean life.",
    scanTitle: "Scan Document / Bill",
    scanDesc: "Translate complex Korean papers into simple English",
    askTitle: "Ask Bridged Anything",
    askDesc: '"What is Jeonip-singgo?" "How do I enroll my kid in school?"',
    categories: "Quick Categories",
    catMoving: "Moving /\nRegistration",
    catVisa: "Visa / Stay",
    catEducation: "Education",
    catHospital: "Hospital /\nInsurance",
    queries: {
      moving: "How do I report my change of address (전입신고)?",
      visa: "How do I extend my Alien Registration Card (ARC) stay period?",
      education: "How do I enroll my kid in elementary school?",
      hospital: "How do I sign up for National Health Insurance (건강보험)?"
    }
  },
  KO: {
    welcome1: "환영합니다!",
    welcome2: "한국 생활에 대해 무엇이든 물어보세요.",
    scanTitle: "문서 / 고지서 스캔",
    scanDesc: "복잡한 한국어 문서를 쉬운 언어로 번역 및 요약",
    askTitle: "무엇이든 물어보세요",
    askDesc: '"전입신고가 무엇인가요?" "아이 학교 입학 절차는?"',
    categories: "빠른 카테고리",
    catMoving: "이사 / 전입신고",
    catVisa: "비자 / 체류",
    catEducation: "학교 / 교육",
    catHospital: "병원 / 건강보험",
    queries: {
      moving: "주소지 변경(전입신고)은 어떻게 신고하나요?",
      visa: "외국인등록증(ARC) 체류 기간 연장은 어떻게 하나요?",
      education: "자녀를 한국 초등학교에 입학시키려면 어떻게 하나요?",
      hospital: "국민건강보험(건강보험) 가입 및 납부는 어떻게 하나요?"
    }
  },
  ZH: {
    welcome1: "欢迎！",
    welcome2: "咨询关于韩国生活的任何问题。",
    scanTitle: "扫描文档 / 账单",
    scanDesc: "将复杂的韩语文件翻译成简易中文",
    askTitle: "向 Bridged 提问",
    askDesc: '"什么是迁入申报？" "如何让孩子入学？"',
    categories: "快捷分类",
    catMoving: "搬家 / 登记",
    catVisa: "签证 / 滞留",
    catEducation: "教育 / 入学",
    catHospital: "医院 / 保险",
    queries: {
      moving: "我该如何申报地址变更（迁入申报）？",
      visa: "如何延期外国人登录证（ARC）的滞留期限？",
      education: "如何让我的孩子入读韩国的小学？",
      hospital: "如何加入并缴纳国民健康保险？"
    }
  },
  VI: {
    welcome1: "Chào mừng!",
    welcome2: "Hỏi bất cứ điều gì về cuộc sống Hàn Quốc.",
    scanTitle: "Quét tài liệu / Hóa đơn",
    scanDesc: "Dịch các tài liệu tiếng Hàn phức tạp sang tiếng Việt dễ hiểu",
    askTitle: "Hỏi Bridged bất cứ điều gì",
    askDesc: '"Khai báo tạm trú là gì?" "Làm thế nào để nhập học cho con?"',
    categories: "Danh mục nhanh",
    catMoving: "Chuyển nhà /\nĐăng ký",
    catVisa: "Visa / Cư trú",
    catEducation: "Giáo dục",
    catHospital: "Bệnh viện /\nBảo hiểm",
    queries: {
      moving: "Làm thế nào để tôi báo cáo thay đổi địa chỉ (전입신고)?",
      visa: "Làm thế nào để gia hạn thời gian lưu trú trên Thẻ đăng ký người nước ngoài (ARC)?",
      education: "Làm thế nào để tôi đăng ký cho con học tiểu học ở Hàn Quốc?",
      hospital: "Làm thế nào để đăng ký Bảo hiểm Y tế Quốc gia?"
    }
  },
  JA: {
    welcome1: "ようこそ！",
    welcome2: "韓国生活について何でも聞いてください。",
    scanTitle: "書類・請求書のスキャン",
    scanDesc: "複雑な韓国語の書類を簡単な日本語に翻訳・要約",
    askTitle: "何でも聞いてください",
    askDesc: '「転入届とは何ですか？」「子供の入学手続きは？」',
    categories: "クイックカテゴリー",
    catMoving: "引っ越し / 登録",
    catVisa: "ビザ / 在留資格",
    catEducation: "教育・入学",
    catHospital: "病院・健康保険",
    queries: {
      moving: "住所変更届（転入届）はどのように行いますか？",
      visa: "外国人登録証（ARC）の在留期間更新はどのように行いますか？",
      education: "子供を韓国の小学校に入学させるにはどうすればいいですか？",
      hospital: "国民健康保険の加入手続きはどうすればいいですか？"
    }
  }
};

export default function HomePage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const t = TRANSLATIONS[lang] || TRANSLATIONS.EN;

  const handleQuickCategoryClick = (categoryKey: string, questionText: string) => {
    // Navigate to guide page with query parameters
    const params = new URLSearchParams();
    params.set("q", questionText);
    params.set("cat", categoryKey);
    router.push(`/guide?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-6 p-5 animate-fade-in-up">
      {/* Welcome Title */}
      <div className="text-[20px] font-bold text-gray-800 leading-[30px] font-poppins">
        <p className="mb-0">{t.welcome1}</p>
        <p>{t.welcome2}</p>
      </div>

      {/* Main Feature Cards */}
      <div className="flex flex-col gap-4">
        {/* Card 1: Scan Document */}
        <Link
          href="/scan"
          className="cursor-pointer group flex items-center gap-4 p-6 rounded-[20px] text-white shadow-md hover:shadow-lg transition-all active:bg-indigo-700"
          style={{
            backgroundImage: "linear-gradient(-45deg, rgb(79, 70, 229) 26.3%, rgb(99, 102, 241) 73.7%)"
          }}
        >
          <span className="text-[32px] select-none p-2 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform block">
            📷
          </span>
          <span className="flex-1 flex flex-col gap-1">
            <span className="font-bold text-[18px] leading-tight flex items-center gap-1.5">
              {t.scanTitle}
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </span>
            <span className="text-[13px] text-indigo-100 leading-snug">
              {t.scanDesc}
            </span>
          </span>
        </Link>

        {/* Card 2: Ask Bridged */}
        <Link
          href="/guide"
          className="cursor-pointer group flex items-center gap-4 p-6 bg-white border-2 border-gray-200 rounded-[20px] text-gray-800 shadow-sm hover:border-indigo-200 hover:shadow-md active:bg-gray-50 transition-all"
        >
          <span className="text-[32px] select-none p-2 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform block">
            💬
          </span>
          <span className="flex-1 flex flex-col gap-1">
            <span className="font-bold text-[18px] leading-tight text-gray-800 flex items-center gap-1.5">
              {t.askTitle}
              <ArrowRight className="w-4 h-4 text-indigo-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </span>
            <span className="text-[13px] text-gray-500 leading-snug">
              {t.askDesc}
            </span>
          </span>
        </Link>
      </div>

      {/* Quick Categories */}
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-[16px] text-gray-800">
          {t.categories}
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Category: Moving */}
          <Link
            href={`/guide?q=${encodeURIComponent(t.queries.moving)}&cat=Moving`}
            className="cursor-pointer bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center gap-2 hover:border-indigo-100 hover:shadow-sm active:bg-indigo-50/20 transition-all"
          >
            <span className="text-[24px]">🏠</span>
            <span className="text-[13px] font-bold text-gray-800 whitespace-pre-line leading-tight">
              {t.catMoving}
            </span>
          </Link>

          {/* Category: Visa */}
          <Link
            href={`/guide?q=${encodeURIComponent(t.queries.visa)}&cat=Visa`}
            className="cursor-pointer bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-2 hover:border-indigo-100 hover:shadow-sm active:bg-indigo-50/20 transition-all"
          >
            <span className="text-[24px]">🪪</span>
            <span className="text-[13px] font-bold text-gray-800 whitespace-pre-line leading-tight">
              {t.catVisa}
            </span>
          </Link>

          {/* Category: Education */}
          <Link
            href={`/guide?q=${encodeURIComponent(t.queries.education)}&cat=Education`}
            className="cursor-pointer bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-2 hover:border-indigo-100 hover:shadow-sm active:bg-indigo-50/20 transition-all"
          >
            <span className="text-[24px]">🎒</span>
            <span className="text-[13px] font-bold text-gray-800 whitespace-pre-line leading-tight">
              {t.catEducation}
            </span>
          </Link>

          {/* Category: Insurance */}
          <Link
            href={`/guide?q=${encodeURIComponent(t.queries.hospital)}&cat=Hospital`}
            className="cursor-pointer bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-2 hover:border-indigo-100 hover:shadow-sm active:bg-indigo-50/20 transition-all"
          >
            <span className="text-[24px]">🏥</span>
            <span className="text-[13px] font-bold text-gray-800 whitespace-pre-line leading-tight">
              {t.catHospital}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

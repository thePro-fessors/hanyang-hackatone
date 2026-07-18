import { NextRequest, NextResponse } from "next/server";
import { generateGuide, RoadmapGuideResult } from "@/lib/gemini";

// Mock data matching Figma school roadmap
const MOCK_SCHOOL_GUIDE: RoadmapGuideResult = {
  title: "Elementary School Enrollment Roadmap for Foreign Families",
  steps: [
    {
      step: 1,
      title: "Step 1: Foreigner Registration",
      content: "Ensure your child's Foreigner Registration (외국인등록) is completed with a valid visa status."
    },
    {
      step: 2,
      title: "Step 2: Prepare Documents",
      content: "You need: Family Relationship Certificate (translated), Passports, Certificate of Alien Registration, and Immunization Records."
    },
    {
      step: 3,
      title: "Step 3: Visit School / Office of Education",
      content: "Visit the nearest elementary school or local Office of Education (교육청) to submit the application."
    }
  ],
  additionalTips: [
    "Proof of Domestic Residency (국내거소신고사실증명) might be required.",
    "Bring your Rental Contract to verify your current address."
  ]
};

const MOCK_SCHOOL_GUIDE_KO: RoadmapGuideResult = {
  title: "외국인 가정 초등학교 입학 로드맵",
  steps: [
    {
      step: 1,
      title: "1단계: 외국인 등록 완료",
      content: "자녀의 외국인등록(외국인등록증 발급) 및 체류 자격 연장이 만료되지 않았는지 미리 확인하십시오."
    },
    {
      step: 2,
      title: "2단계: 입학 서류 준비",
      content: "가족관계증명서 번역본, 부모 및 자녀 여권, 외국인등록사실증명서, 그리고 예방접종 증명서 등을 준비합니다."
    },
    {
      step: 3,
      title: "3단계: 학교 또는 교육청 방문",
      content: "거주지 근처 초등학교 또는 지역 관할 교육청에 입학 신청서와 구비 서류를 제출합니다."
    }
  ],
  additionalTips: [
    "상황에 따라 국내거소신고사실증명이 필요할 수 있습니다.",
    "거주지 주소 확인을 위해 전월세 임대차 계약서 원본을 가져가야 합니다."
  ]
};

// General fallback guide
const MOCK_GENERAL_GUIDE: RoadmapGuideResult = {
  title: "Korean Residency & Administrative Roadmap",
  steps: [
    {
      step: 1,
      title: "Step 1: Locate Service Center",
      content: "Find your local Community Service Center (주민센터) or Immigration Office (출입국관리사무소) based on your district."
    },
    {
      step: 2,
      title: "Step 2: Prepare Identifications",
      content: "Ensure you have your Passport, Alien Registration Card (ARC), and lease contract (임대차계약서) ready."
    },
    {
      step: 3,
      title: "Step 3: Report within 14 Days",
      content: "Any change in residence or status must be reported within 14 days to avoid administrative fines."
    }
  ],
  additionalTips: [
    "Call 1345 (Immigration General Contact Center) for 24/7 multilingual support.",
    "Use government portals like Gov24 (정부24) for issuing documents online with public certificate."
  ]
};

export async function POST(req: NextRequest) {
  let question = "";
  let category = "General";
  let lang = "EN";
  try {
    const body = await req.json();
    question = body.question || "";
    category = body.category || "General";
    lang = body.lang || "EN";

    if (!question) {
      return NextResponse.json(
        { error: "Missing question parameter" },
        { status: 400 }
      );
    }

    // Determine target language string
    let targetLang = "English";
    if (lang === "KO") targetLang = "Korean";
    else if (lang === "ZH") targetLang = "Chinese";
    else if (lang === "VI") targetLang = "Vietnamese";
    else if (lang === "JA") targetLang = "Japanese";

    // If API Key is missing, bypass and return mock data for seamless demo
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Returning Figma mock data.");
      const isSchoolQuery = /school|education|kid|child|학교|입학|교육|아이/.test(question.toLowerCase());
      if (isSchoolQuery) {
        return NextResponse.json(lang === "KO" ? MOCK_SCHOOL_GUIDE_KO : MOCK_SCHOOL_GUIDE);
      }
      return NextResponse.json(MOCK_GENERAL_GUIDE);
    }

    const result = await generateGuide(question, category, targetLang);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Guide Error:", error);
    // Fallback on failure
    console.warn("Returning fallback mock data due to API error.");
    const isSchoolQuery = /school|education|kid|child|학교|입학|교육|아이/.test(question?.toLowerCase() || "");
    const isKo = lang === "KO";
    if (isSchoolQuery) {
      return NextResponse.json(isKo ? MOCK_SCHOOL_GUIDE_KO : MOCK_SCHOOL_GUIDE);
    }
    return NextResponse.json(MOCK_GENERAL_GUIDE);
  }
}

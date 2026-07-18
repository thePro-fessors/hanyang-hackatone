import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument, DocumentAnalysisResult } from "@/lib/gemini";

// Fallback mock data matching Figma spec for presentation resilience
const MOCK_SCAN_RESULT: DocumentAnalysisResult = {
  documentType: "Health Insurance Bill",
  documentTypeKo: "건강보험료 납부 안내문",
  dDay: 3,
  deadline: "August 10th",
  amount: "54,300 KRW",
  actionItems: [
    "Open any Korean Banking App on your smartphone.",
    "Go to the Menu and select [Giro / Utility Bill (지로/공과금)].",
    "Enter your Electronic Payment Number: 1234-5678-90"
  ],
  warningTitle: "If you miss the deadline:",
  warningContent: "Late fees (approx. 3%) may be added to your next bill."
};

const MOCK_SCAN_RESULT_KO: DocumentAnalysisResult = {
  documentType: "건강보험 고지서",
  documentTypeKo: "건강보험료 납부 안내문",
  dDay: 3,
  deadline: "8월 10일",
  amount: "54,300 원",
  actionItems: [
    "스마트폰에서 시중 은행 앱을 실행합니다.",
    "메뉴로 이동하여 [지로/공과금] 납부를 선택합니다.",
    "납부고지서 상의 전자납부번호(1234-5678-90)를 입력하여 납부합니다."
  ],
  warningTitle: "납부 기한을 놓치면:",
  warningContent: "다음 달 고지서에 약 3%의 가산금(연체료)이 추가될 수 있습니다."
};

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType, lang } = await req.json();

    if (!image || !mimeType) {
      return NextResponse.json(
        { error: "Missing image or mimeType parameters" },
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
      return NextResponse.json(lang === "KO" ? MOCK_SCAN_RESULT_KO : MOCK_SCAN_RESULT);
    }

    const result = await analyzeDocument(image, mimeType, targetLang);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Analyze Error:", error);
    // Return mock fallback in case of rate limits or failures to keep the hackathon demo alive
    console.warn("Returning fallback mock data due to API error.");
    const lang = req.headers.get("accept-language")?.includes("ko") ? "KO" : "EN";
    return NextResponse.json(lang === "KO" ? MOCK_SCAN_RESULT_KO : MOCK_SCAN_RESULT);
  }
}

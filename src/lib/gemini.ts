import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";

// Initialize Gemini API Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Warning: GEMINI_API_KEY is not defined in environment variables.");
  }
  return new GoogleGenerativeAI(apiKey || "");
};

// Interface for Document analysis output
export interface DocumentAnalysisResult {
  documentType: string;
  documentTypeKo: string;
  dDay: number;
  deadline: string;
  amount: string | null;
  actionItems: string[];
  warningTitle: string;
  warningContent: string;
}

// Interface for AI Roadmap Guide output
export interface RoadmapStep {
  step: number;
  title: string;
  content: string;
}

export interface RoadmapGuideResult {
  title: string;
  steps: RoadmapStep[];
  additionalTips: string[];
}

// Schema definition for Document Analysis
const documentAnalysisSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    documentType: {
      type: SchemaType.STRING,
      description: "Simplified English name of the document (e.g., 'Health Insurance Bill')"
    },
    documentTypeKo: {
      type: SchemaType.STRING,
      description: "The exact original Korean title found in the document (e.g., '건강보험료 납부 안내문')"
    },
    dDay: {
      type: SchemaType.INTEGER,
      description: "Days remaining until deadline relative to current date (e.g., 3. If no clear deadline or past, return 0)"
    },
    deadline: {
      type: SchemaType.STRING,
      description: "Payment or processing deadline translated nicely (e.g., 'August 10th')"
    },
    amount: {
      type: SchemaType.STRING,
      description: "Total amount to pay in KRW, formatted (e.g., '54,300 KRW'). If not a bill, return null."
    },
    actionItems: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Step-by-step instructions on what the user needs to do (e.g., '1. Open banking app...', '2. Select Giro...'). Extract up to 3-4 clear steps."
    },
    warningTitle: {
      type: SchemaType.STRING,
      description: "A concise title for warnings or penalties if missed (e.g., 'If you miss the deadline:')"
    },
    warningContent: {
      type: SchemaType.STRING,
      description: "Detailed warning or penalty (e.g., 'Late fees (approx. 3%) may be added to your next bill.')"
    }
  },
  required: [
    "documentType",
    "documentTypeKo",
    "dDay",
    "deadline",
    "amount",
    "actionItems",
    "warningTitle",
    "warningContent"
  ]
};

// Schema definition for Roadmap Guide
const roadmapGuideSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description: "A clean title for the roadmap (e.g., 'Elementary School Enrollment Roadmap for Foreign Families')"
    },
    steps: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          step: { type: SchemaType.INTEGER },
          title: { type: SchemaType.STRING },
          content: { type: SchemaType.STRING }
        },
        required: ["step", "title", "content"]
      },
      description: "Provide exactly 3 key steps."
    },
    additionalTips: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Bullet-pointed additional tips, specific Korean documents required, or warnings"
    }
  },
  required: ["title", "steps", "additionalTips"]
};

/**
 * Analyzes a document image (Base64) using Gemini multimodal model.
 * Returns parsed information in a structured JSON format.
 */
export async function analyzeDocument(
  base64Image: string,
  mimeType: string,
  targetLang: string = "English"
): Promise<DocumentAnalysisResult> {
  const ai = getGeminiClient();
  const model = ai.getGenerativeModel({ model: "gemini-3.5-flash" });

  const prompt = `You are BridgeAI, an expert assistant for foreign residents in Korea.
Analyze this official Korean document/bill image (such as health insurance bills, tax notices, or administrative letters) and extract key information.
Translate and simplify all instructions so they are easily understandable.

You must respond ONLY with a JSON object matching the following TypeScript interface:
interface DocumentAnalysisResult {
  documentType: string;
  documentTypeKo: string;
  dDay: number;
  deadline: string;
  amount: string | null;
  actionItems: string[];
  warningTitle: string;
  warningContent: string;
}

Provide the response in the selected target language: "${targetLang}".
Return ONLY the raw JSON. Do not write markdown blocks or backticks.`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Image.split(",")[1] || base64Image,
                mimeType: mimeType
              }
            },
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: documentAnalysisSchema
      }
    });

    const text = result.response.text();
    return cleanAndParseJSON(text) as DocumentAnalysisResult;
  } catch (error) {
    console.error("Error analyzing document with Gemini:", error);
    throw new Error("Failed to analyze the document. Please ensure the image is clear and try again.");
  }
}

/**
 * Generates a step-by-step administrative roadmap guide based on user question or situation.
 */
export async function generateGuide(
  question: string,
  category: string = "General",
  targetLang: string = "English"
): Promise<RoadmapGuideResult> {
  const ai = getGeminiClient();
  const model = ai.getGenerativeModel({ model: "gemini-3.5-flash" });

  const prompt = `You are BridgeAI, a specialized AI assistant that helps foreign residents navigate Korean laws, administration, and daily life.
The user has the following question/situation: "${question}" (Category: ${category}).

Analyze this situation and provide a step-by-step roadmap and helpful tips. Keep steps practical, specific, and easy to follow.

You must respond ONLY with a JSON object matching the following TypeScript interface:
interface RoadmapGuideResult {
  title: string;
  steps: Array<{
    step: number;
    title: string;
    content: string;
  }>;
  additionalTips: string[];
}

Provide all content (except original Korean terms in parentheses) translated into the selected target language: "${targetLang}".
Return ONLY the raw JSON. Do not write markdown blocks or backticks.`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: roadmapGuideSchema
      }
    });

    const text = result.response.text();
    return cleanAndParseJSON(text) as RoadmapGuideResult;
  } catch (error) {
    console.error("Error generating guide with Gemini:", error);
    throw new Error("Failed to generate guide. Please try again with a different query.");
  }
}

// Robust JSON parsing helper to safely handle markdown backticks or trailing notes
function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim();
  
  // Find first '{' and last '}' to extract raw JSON block cleanly
  const startIdx = cleaned.indexOf("{");
  const endIdx = cleaned.lastIndexOf("}");
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  } else {
    // Fallback regex cleaning if braces are not matched
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/i, "");
      cleaned = cleaned.replace(/\n?```$/i, "");
    }
  }
  
  cleaned = cleaned.trim();
  return JSON.parse(cleaned);
}

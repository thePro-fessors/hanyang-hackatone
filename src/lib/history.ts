import { DocumentAnalysisResult, RoadmapGuideResult } from "./gemini";

export interface ScanHistoryItem {
  id: string;
  date: string;
  originalImage: string;
  result: DocumentAnalysisResult;
}

export interface GuideHistoryItem {
  id: string;
  date: string;
  question: string;
  category: string;
  result: RoadmapGuideResult;
}

const STORAGE_KEYS = {
  SCAN_HISTORY: "bridgeai_scan_history",
  GUIDE_HISTORY: "bridgeai_guide_history",
  APP_LANGUAGE: "bridgeai_language"
};

// Safe access helper for LocalStorage in SSR & Incognito/Private Mode context
const getLocalStorage = (): Storage | null => {
  if (typeof window !== "undefined") {
    try {
      // Test if localStorage is writable (avoids SecurityError in incognito modes)
      const testKey = "__localstorage_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (e) {
      console.warn("LocalStorage access denied (Incognito/Private Mode):", e);
      return null;
    }
  }
  return null;
};

// --- Scan History ---

export function getScanHistory(): ScanHistoryItem[] {
  const storage = getLocalStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEYS.SCAN_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse scan history:", e);
    return [];
  }
}

export function saveScanHistory(items: ScanHistoryItem[]): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save scan history:", e);
  }
}

export function addScanHistory(originalImage: string, result: DocumentAnalysisResult): ScanHistoryItem {
  const items = getScanHistory();
  const newItem: ScanHistoryItem = {
    id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    originalImage,
    result
  };
  
  // Save to the beginning of the list
  saveScanHistory([newItem, ...items]);
  return newItem;
}

// --- Guide History ---

export function getGuideHistory(): GuideHistoryItem[] {
  const storage = getLocalStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEYS.GUIDE_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse guide history:", e);
    return [];
  }
}

export function saveGuideHistory(items: GuideHistoryItem[]): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.GUIDE_HISTORY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save guide history:", e);
  }
}

export function addGuideHistory(
  question: string,
  category: string,
  result: RoadmapGuideResult
): GuideHistoryItem {
  const items = getGuideHistory();
  const newItem: GuideHistoryItem = {
    id: `guide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    question,
    category,
    result
  };
  
  saveGuideHistory([newItem, ...items]);
  return newItem;
}

// --- App Language State ---

export function getAppLanguage(): string {
  const storage = getLocalStorage();
  if (!storage) return "EN";
  return storage.getItem(STORAGE_KEYS.APP_LANGUAGE) || "EN";
}

export function setAppLanguage(lang: string): void {
  const storage = getLocalStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEYS.APP_LANGUAGE, lang);
  
  // Trigger storage event for cross-component reactivity with robust cross-browser safety
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new Event("storage_lang_change"));
    } catch (e) {
      try {
        const event = document.createEvent("Event");
        event.initEvent("storage_lang_change", true, true);
        window.dispatchEvent(event);
      } catch (err) {
        console.error("Failed to dispatch custom event:", err);
      }
    }
  }
}

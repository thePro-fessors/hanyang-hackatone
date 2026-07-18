"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getAppLanguage, setAppLanguage } from "./history";

interface LanguageContextType {
  lang: string;
  changeLanguage: (selectedLang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState("EN");

  // Load language state from storage (if available) on initial mount
  useEffect(() => {
    setLang(getAppLanguage());
  }, []);

  const changeLanguage = (selectedLang: string) => {
    setAppLanguage(selectedLang);
    setLang(selectedLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { Globe, Home, FileText, Lightbulb } from "lucide-react";

interface MobileFrameProps {
  children: React.ReactNode;
}

const LANGUAGES = [
  { code: "EN", label: "🌐 EN" },
  { code: "KO", label: "🌐 KO" },
  { code: "ZH", label: "🌐 ZH" },
  { code: "VI", label: "🌐 VI" },
  { code: "JA", label: "🌐 JA" }
];

export default function MobileFrame({ children }: MobileFrameProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, changeLanguage } = useLanguage();
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const handleLangSelect = (selectedLang: string, e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    changeLanguage(selectedLang);
    setShowLangDropdown(false);
  };

  const handleToggleDropdown = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLangDropdown(prev => !prev);
  };

  const navItems = [
    { id: "home", path: "/", label: "Home", icon: Home },
    { id: "scan", path: "/scan", label: "Scan Result", icon: FileText },
    { id: "guide", path: "/guide", label: "AI Guide", icon: Lightbulb }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    // Outer page wrapper that centers the mock app frame on desktop screen sizes
    <div className="min-h-screen w-full bg-slate-900 md:bg-slate-950 flex items-start md:items-center justify-center font-sans overflow-hidden">
      
      {/* 
        Mobile WebApp Container
        - Mobile: h-[100dvh] (Dynamic Viewport Height) / w-full (fills screen)
        - Desktop: w-[390px] / h-[850px] mock phone aspect ratio
      */}
      <div className="relative w-full md:max-w-md h-[100dvh] md:h-[850px] bg-[#f3f4f6] md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:border-4 md:border-slate-800">
        
        {/* WebApp Header: Fixed height, non-overlapping flex child */}
        <header className="relative h-[60px] bg-white border-b border-gray-200/80 px-5 flex items-center justify-between z-40 shrink-0 shadow-sm">
          <Link 
            href="/"
            className="font-extrabold text-[20px] text-[#4f46e5] font-poppins tracking-tight select-none"
          >
            Bridged
          </Link>
          
          {/* Language Selector Dropdown */}
          <div className="relative">
            <div
              role="button"
              onClick={handleToggleDropdown}
              className="bg-[#eef2f6] text-[#4f46e5] text-[13px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-[#e0e7ff] transition cursor-pointer pointer-events-auto select-none"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang}</span>
            </div>

            {showLangDropdown && (
              <div className="absolute right-0 mt-1.5 w-24 bg-white rounded-2xl shadow-xl border border-gray-150 py-1 z-50 animate-fade-in-up">
                {LANGUAGES.map((item) => (
                  <div
                    key={item.code}
                    onClick={(e) => handleLangSelect(item.code, e)}
                    className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 transition text-gray-600 active:bg-gray-100 block cursor-pointer select-none pointer-events-auto"
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* 
          WebApp Content Container
          - Uses overflow-y-auto to scroll internally.
          - Because it is a flex child with flex-1, it never overlaps the header or navigation bar,
            preventing touch gesture interception bugs on mobile chrome.
        */}
        <main className="flex-1 overflow-y-auto bg-[#f3f4f6] relative z-10 w-full">
          {children}
        </main>

        {/* 
          WebApp Navigation Bar (Bottom Tabbar)
          - Placed as a normal flex child at the bottom, eliminating fixed/absolute overlaps.
          - Handled with pb-safe to respect mobile device safe areas (notches/bars).
        */}
        <nav className="h-[68px] bg-white border-t border-gray-200/85 flex items-center justify-around px-4 z-30 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] pb-safe">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                className="flex flex-col items-center justify-center gap-1 w-[72px] focus:outline-none transition group"
              >
                <span className={`p-1 rounded-lg transition-colors block ${
                  isActive ? "text-[#4f46e5]" : "text-gray-400 group-hover:text-gray-600"
                }`}>
                  <Icon className="w-5.5 h-5.5" />
                </span>
                <span className={`text-[10px] font-bold tracking-tight transition ${
                  isActive ? "text-[#4f46e5]" : "text-gray-500 group-hover:text-gray-700"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import MobileFrame from "@/components/MobileFrame";
import { LanguageProvider } from "@/lib/LanguageContext";

export const metadata: Metadata = {
  title: "BridgeAI - Easy Korea Life AI Guide",
  description: "Analyze complex Korean bills and documents into easy multilingual guides using Gemini AI. Translate, summarize, and get step-by-step roadmaps instantly."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-gray-800 antialiased font-sans m-0 p-0 overflow-x-hidden">
        <LanguageProvider>
          <MobileFrame>{children}</MobileFrame>
        </LanguageProvider>
      </body>
    </html>
  );
}

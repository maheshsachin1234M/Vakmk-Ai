import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

import { AnimatedBackground } from "../components/shared/AnimatedBackground";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VAKMK AI — Engineering Intelligence Platform",
  description:
    "Upload technical documents and chat with them using AI-powered semantic search and retrieval-augmented generation.",
  keywords: ["VAKMK AI", "RAG", "AI", "engineering", "document chat", "LLM"],
  authors: [{ name: "VAKMK AI" }],
  openGraph: {
    title: "VAKMK AI — Engineering Intelligence Platform",
    description:
      "Premium AI platform for chatting with your technical documents.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${display.variable}`}>
      <body className="font-sans min-h-screen antialiased relative">
        <AnimatedBackground />
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(20, 20, 30, 0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "white",
            },
          }}
        />
      </body>
    </html>
  );
}

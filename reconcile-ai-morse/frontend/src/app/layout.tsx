import type { Metadata } from "next";
import Script from "next/script";
import { Newsreader, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"]
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReconcileAI — Autonomous Bank & Invoice Ledger",
  description: "Deterministic financial reconciliation workbench with Morse observability & unit economics telemetry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased min-h-screen bg-[#F7F6F2] text-[#141413] selection:bg-[#EBE9E1]">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Electrolize } from "next/font/google";
import UppercaseGuard from "@/components/UppercaseGuard";
import "./globals.css";
import "./button-standard.css";
import "./scenario-standard.css";
import "./unified-background.css";

const electrolize = Electrolize({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "STACKUP HOLD'EM HEROES",
  description: "AI POKER PERFORMANCE SYSTEM.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={electrolize.className}>
      <head>
        <style>{`html body, html body *, html body *::before, html body *::after { text-transform: uppercase !important; }`}</style>
      </head>
      <body className="unified-background">
        <UppercaseGuard />
        {children}
      </body>
    </html>
  );
}

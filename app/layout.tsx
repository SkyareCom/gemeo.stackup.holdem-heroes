import type { Metadata } from "next";
import { Goldman } from "next/font/google";
import "./globals.css";
import "./ui-sync.css";

const goldman = Goldman({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-goldman" });

export const metadata: Metadata = {
  title: "STACKUP HOLD'EM HEROES",
  description: "AI Poker Performance System.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={goldman.variable}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Changa } from "next/font/google";
import "./globals.css";

const changa = Changa({ subsets: ["latin"], variable: "--font-changa" });

export const metadata: Metadata = {
  title: "STACKUP HOLD'EM HEROES",
  description: "AI Poker Performance System.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={changa.variable}>
      <body>{children}</body>
    </html>
  );
}

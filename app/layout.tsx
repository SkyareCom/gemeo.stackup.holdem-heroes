import type { Metadata } from "next";
import { Doppio_One } from "next/font/google";
import UppercaseGuard from "../components/UppercaseGuard";
import "./globals.css";
import "./text-case.css";

const doppioOne = Doppio_One({ subsets: ["latin"], weight: "400", variable: "--font-doppio-one" });

export const metadata: Metadata = {
  title: "STACKUP HOLD'EM HEROES",
  description: "AI POKER PERFORMANCE SYSTEM.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={doppioOne.variable}>
      <body><UppercaseGuard />{children}</body>
    </html>
  );
}

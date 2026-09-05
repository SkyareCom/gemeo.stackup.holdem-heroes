import type { Metadata } from "next";
import { Doppio_One } from "next/font/google";
import "./globals.css";

const doppioOne = Doppio_One({ subsets: ["latin"], weight: "400", variable: "--font-doppio-one" });

export const metadata: Metadata = {
  title: "STACKUP HOLD'EM HEROES",
  description: "AI Poker Performance System.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={doppioOne.variable}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import "./globals.css";
import "./ui-sync.css";

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-chakra-petch",
});

export const metadata: Metadata = {
  title: "STACKUP HOLD'EM HEROES",
  description: "AI Poker Performance System.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={chakraPetch.variable}>
      <body>{children}</body>
    </html>
  );
}

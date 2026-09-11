import type { Metadata } from "next";
import { Love_Ya_Like_A_Sister } from "next/font/google";
import UppercaseGuard from "@/components/UppercaseGuard";
import "./globals.css";
import "./button-standard.css";
import "./scenario-standard.css";
import "./unified-background.css";
import "./stackup-blue-theme.css";
import "./stackup-palette-contract.css";

const loveYaLikeASister = Love_Ya_Like_A_Sister({
  subsets:["latin"],
  weight:"400",
  variable:"--font-love-ya-like-a-sister",
});

export const metadata: Metadata = {
  title: "STACKUP HOLD'EM HEROES",
  description: "AI POKER PERFORMANCE SYSTEM.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={loveYaLikeASister.className}>
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

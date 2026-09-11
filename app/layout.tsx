import type { Metadata } from "next";
import { Love_Ya_Like_A_Sister } from "next/font/google";
import UppercaseGuard from "@/components/UppercaseGuard";
import "./globals.css";
import "./button-standard.css";
import "./scenario-standard.css";
import "./unified-background.css";
import "./stackup-blue-theme.css";
import "./stackup-contrast-blue.css";
import "./stackup-ui-contract.css";
import "./heroes-template-v2.css";
import "./heroes-typography-v3.css";

const loveYaLikeASister = Love_Ya_Like_A_Sister({
  subsets:["latin"],
  weight:"400",
  variable:"--font-love-ya-like-a-sister",
});

export const metadata: Metadata = {
  title: "STACKUP HOLD'EM HEROES",
  description: "AI POKER PERFORMANCE SYSTEM.",
  icons: {
    icon: "/gemeo.stackup.holdem-heroes/stackup-heroes-logo.png",
    apple: "/gemeo.stackup.holdem-heroes/stackup-heroes-logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${loveYaLikeASister.className} ${loveYaLikeASister.variable}`}>
      <head>
        <style>{`html body, html body *, html body *::before, html body *::after { text-transform: uppercase !important; } html body [data-preserve-case="true"], html body [data-preserve-case="true"] * { text-transform: none !important; }`}</style>
      </head>
      <body className="unified-background">
        <UppercaseGuard />
        {children}
      </body>
    </html>
  );
}

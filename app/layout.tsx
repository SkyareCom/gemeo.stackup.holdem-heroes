import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STACKUP SOLVER",
  description: "Poker intelligence, analysis and training in one app.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

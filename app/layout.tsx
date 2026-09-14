import type { Metadata } from "next";
import { Love_Ya_Like_A_Sister } from "next/font/google";
import UppercaseGuard from "@/components/UppercaseGuard";
import "./globals.css";
import "./button-standard.css";
import "./unified-background.css";
import "./stackup-blue-theme.css";
import "./stackup-contrast-blue.css";
import "./stackup-ui-contract.css";
import "./heroes-template-v2.css";
import "./heroes-typography-v3.css";
import "./button-state-contract.css";
import "./home-typography-final.css";
import "./home-balance-v20.css";

const loveYaLikeASister = Love_Ya_Like_A_Sister({
  subsets:["latin"],
  weight:"400",
  variable:"--font-love-ya-like-a-sister",
});

const CACHE_RESET_VERSION = "20260914-v4";

export const metadata: Metadata = {
  title: "STACKUP HOLD'EM HEROES",
  description: "AI POKER PERFORMANCE SYSTEM.",
  icons: {
    icon: "/gemeo.stackup.holdem-heroes/stackup-heroes-logo-128-valid-20260911.png",
    apple: "/gemeo.stackup.holdem-heroes/stackup-heroes-logo-128-valid-20260911.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${loveYaLikeASister.className} ${loveYaLikeASister.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{__html:`(()=>{const APP='/gemeo.stackup.holdem-heroes/';const VERSION='${CACHE_RESET_VERSION}';const KEY='heroes-cache-reset-'+VERSION;const RELOAD_KEY=KEY+'-reload';const cleanup=async()=>{try{if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.filter(r=>{try{return new URL(r.scope).pathname.startsWith(APP)}catch(_){return false}}).map(r=>r.unregister()));}if(!localStorage.getItem(KEY)&&'caches'in window){const names=await caches.keys();await Promise.all(names.map(async name=>{try{const cache=await caches.open(name);const reqs=await cache.keys();const belongs=reqs.some(req=>{try{return new URL(req.url).pathname.startsWith(APP)}catch(_){return false}});if(belongs)await caches.delete(name);}catch(_){}}));localStorage.setItem(KEY,'1');if(!sessionStorage.getItem(RELOAD_KEY)){sessionStorage.setItem(RELOAD_KEY,'1');const url=new URL(location.href);url.searchParams.set('_hv',VERSION);location.replace(url.toString());}}}catch(_){}};cleanup();})();`}} />
        <style>{`html body, html body *, html body *::before, html body *::after { text-transform: uppercase !important; } html body [data-preserve-case="true"], html body [data-preserve-case="true"] * { text-transform: none !important; }`}</style>
      </head>
      <body className="unified-background">
        <UppercaseGuard />
        {children}
      </body>
    </html>
  );
}

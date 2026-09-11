"use client";

import { useEffect } from "react";

const ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"] as const;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]);
const PRESERVE_CASE_SELECTOR = '[data-preserve-case="true"]';
const FONT_FAMILY = 'var(--font-love-ya-like-a-sister), "Love Ya Like A Sister", cursive';

const TITLE_RE = /(^|[\s_-])(title|heading|prompt|question)([\s_-]|$)/i;
const SUBTITLE_RE = /(^|[\s_-])(subtitle|lead|status|count)([\s_-]|$)/i;
const SECONDARY_RE = /(^|[\s_-])(description|helper|hint|caption|secondary|eyebrow|tag|meta|participants|label|kicker)([\s_-]|$)/i;
const TEXT_RE = /(^|[\s_-])(title|heading|prompt|question|subtitle|lead|status|count|description|helper|hint|caption|secondary|eyebrow|tag|meta|participants|label|kicker)([\s_-]|$)/i;

function shouldPreserveCase(node: Node) {
  const element = node instanceof Element ? node : node.parentElement;
  return Boolean(element?.closest(PRESERVE_CASE_SELECTOR));
}

function uppercaseTextNode(node: Node) {
  const parent = node.parentElement;
  if (!parent || SKIP_TAGS.has(parent.tagName) || shouldPreserveCase(node)) return;
  const value = node.nodeValue;
  if (!value) return;
  const upper = value.toLocaleUpperCase("pt-BR");
  if (upper !== value) node.nodeValue = upper;
}

function applyGlobalFont(element: Element) {
  if (element instanceof HTMLElement || element instanceof SVGElement) {
    element.style.setProperty("font-family", FONT_FAMILY, "important");
  }
}

function getTypeScale(element: HTMLElement) {
  if (element.closest('[aria-hidden="true"]')) return null;

  const tag = element.tagName;
  const className = element.getAttribute("class") ?? "";

  if (/^H[1-6]$/.test(tag) || TITLE_RE.test(className)) {
    return { size: "20px", lineHeight: "1.18" };
  }

  if (SUBTITLE_RE.test(className)) {
    return { size: "16px", lineHeight: "1.32" };
  }

  if (tag === "SMALL" || SECONDARY_RE.test(className)) {
    return { size: "12px", lineHeight: "1.36" };
  }

  return { size: "14px", lineHeight: "1.4" };
}

function applyTypeScale(element: Element) {
  if (!(element instanceof HTMLElement)) return;
  const scale = getTypeScale(element);
  if (!scale) return;
  element.style.setProperty("font-size", scale.size, "important");
  element.style.setProperty("line-height", scale.lineHeight, "important");
}

function applyOverflowSafety(element: Element) {
  if (!(element instanceof HTMLElement || element instanceof SVGElement)) return;

  element.style.setProperty("box-sizing", "border-box", "important");

  if (element instanceof HTMLElement) {
    element.style.setProperty("min-width", "0", "important");

    if (element.matches("img,video,canvas,input,textarea,select,button")) {
      element.style.setProperty("max-width", "100%", "important");
    }

    const className = element.getAttribute("class") ?? "";
    const textualTag = /^(H[1-6]|P|SMALL|LABEL|A|BUTTON|STRONG|B)$/.test(element.tagName);
    if (textualTag || TEXT_RE.test(className)) {
      element.style.setProperty("overflow-wrap", "anywhere", "important");
      element.style.setProperty("word-break", "normal", "important");
      element.style.setProperty("white-space", "normal", "important");
    }
  }
}

function lockElement(element: Element) {
  applyGlobalFont(element);
  applyTypeScale(element);
  applyOverflowSafety(element);

  if (!shouldPreserveCase(element) && element instanceof HTMLElement) {
    element.style.setProperty("text-transform", "uppercase", "important");
  }

  if (!shouldPreserveCase(element)) {
    for (const attribute of ATTRIBUTES) {
      const value = element.getAttribute(attribute);
      if (value) {
        const upper = value.toLocaleUpperCase("pt-BR");
        if (upper !== value) element.setAttribute(attribute, upper);
      }
    }
  }

  if (element.shadowRoot) enforceTree(element.shadowRoot);
}

function enforceTree(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    uppercaseTextNode(root);
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null = walker.nextNode();
  while (node) {
    uppercaseTextNode(node);
    node = walker.nextNode();
  }

  if (root instanceof Element) lockElement(root);
  if (root instanceof Element || root instanceof DocumentFragment || root instanceof Document) {
    root.querySelectorAll("*").forEach(lockElement);
  }
}

export default function UppercaseGuard() {
  useEffect(() => {
    document.documentElement.style.setProperty("font-family", FONT_FAMILY, "important");
    document.body.style.setProperty("font-family", FONT_FAMILY, "important");
    document.documentElement.style.setProperty("max-width", "100%", "important");
    document.body.style.setProperty("max-width", "100%", "important");
    document.documentElement.style.setProperty("overflow-x", "hidden", "important");
    document.body.style.setProperty("overflow-x", "hidden", "important");
    enforceTree(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          uppercaseTextNode(mutation.target);
          continue;
        }
        if (mutation.type === "attributes" && mutation.target instanceof Element) {
          lockElement(mutation.target);
          continue;
        }
        for (const addedNode of mutation.addedNodes) enforceTree(addedNode);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRIBUTES],
    });

    const enforce = window.setInterval(() => enforceTree(document.body), 500);

    return () => {
      observer.disconnect();
      window.clearInterval(enforce);
    };
  }, []);

  return null;
}

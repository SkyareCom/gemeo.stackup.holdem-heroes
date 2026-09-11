"use client";

import { useEffect } from "react";

const ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"] as const;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]);
const PRESERVE_CASE_SELECTOR = '[data-preserve-case="true"]';
const FONT_FAMILY = 'var(--font-love-ya-like-a-sister), "Love Ya Like A Sister", cursive';

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

function lockElement(element: Element) {
  // Font is global, including content that preserves its original letter case.
  // Inline !important intentionally wins over legacy/local module CSS declarations.
  applyGlobalFont(element);

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
    // Lock the Google font on the whole rendered app, after all module CSS is loaded.
    document.documentElement.style.setProperty("font-family", FONT_FAMILY, "important");
    document.body.style.setProperty("font-family", FONT_FAMILY, "important");
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

    // Reapply periodically because some interactive modules inject inline styles at runtime.
    const enforce = window.setInterval(() => enforceTree(document.body), 500);

    return () => {
      observer.disconnect();
      window.clearInterval(enforce);
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

const ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"] as const;

function uppercaseElement(root: ParentNode) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const parent = node.parentElement;
    if (!parent) continue;
    if (["SCRIPT", "STYLE", "CODE", "PRE"].includes(parent.tagName)) continue;
    if (node.nodeValue && node.nodeValue !== node.nodeValue.toUpperCase()) {
      textNodes.push(node);
    }
  }

  for (const node of textNodes) {
    node.nodeValue = node.nodeValue?.toUpperCase() ?? node.nodeValue;
  }

  const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll("*"))] : Array.from(root.querySelectorAll("*"));
  for (const element of elements) {
    for (const attribute of ATTRIBUTES) {
      const value = element.getAttribute(attribute);
      if (value && value !== value.toUpperCase()) {
        element.setAttribute(attribute, value.toUpperCase());
      }
    }

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      if (element.value && element.value !== element.value.toUpperCase()) {
        element.value = element.value.toUpperCase();
      }
    }
  }
}

export default function UppercaseGuard() {
  useEffect(() => {
    const apply = () => uppercaseElement(document.body);
    apply();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          const node = mutation.target as Text;
          const parent = node.parentElement;
          if (!parent || ["SCRIPT", "STYLE", "CODE", "PRE"].includes(parent.tagName)) continue;
          const value = node.nodeValue ?? "";
          const upper = value.toUpperCase();
          if (value !== upper) node.nodeValue = upper;
          continue;
        }

        if (mutation.type === "attributes") {
          const element = mutation.target as Element;
          const name = mutation.attributeName;
          if (name && ATTRIBUTES.includes(name as (typeof ATTRIBUTES)[number])) {
            const value = element.getAttribute(name);
            if (value && value !== value.toUpperCase()) element.setAttribute(name, value.toUpperCase());
          }
          continue;
        }

        for (const added of Array.from(mutation.addedNodes)) {
          if (added.nodeType === Node.TEXT_NODE) {
            const text = added as Text;
            const value = text.nodeValue ?? "";
            const upper = value.toUpperCase();
            if (value !== upper) text.nodeValue = upper;
          } else if (added instanceof Element) {
            uppercaseElement(added);
          }
        }
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRIBUTES],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}

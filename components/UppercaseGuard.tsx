"use client";

import { useEffect } from "react";

const ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"] as const;

function uppercaseTree(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null = walker.nextNode();

  while (node) {
    const parent = node.parentElement;
    if (parent && !["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) {
      const value = node.nodeValue;
      if (value) node.nodeValue = value.toLocaleUpperCase("pt-BR");
    }
    node = walker.nextNode();
  }

  if (root instanceof Element) {
    const elements = [root, ...Array.from(root.querySelectorAll("*"))];
    for (const element of elements) {
      for (const attribute of ATTRIBUTES) {
        const value = element.getAttribute(attribute);
        if (value) element.setAttribute(attribute, value.toLocaleUpperCase("pt-BR"));
      }
    }
  }
}

export default function UppercaseGuard() {
  useEffect(() => {
    uppercaseTree(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          const value = mutation.target.nodeValue;
          if (value) {
            const upper = value.toLocaleUpperCase("pt-BR");
            if (upper !== value) mutation.target.nodeValue = upper;
          }
          continue;
        }

        for (const addedNode of mutation.addedNodes) uppercaseTree(addedNode);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}

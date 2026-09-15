"use client";

import { useEffect } from "react";

const ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"] as const;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]);
const PRESERVE_CASE_SELECTOR = '[data-preserve-case="true"]';
const MANUAL_TYPE_SCALE_SELECTOR = '[data-manual-type-scale="true"]';
const INTERNAL_ROOT_SELECTOR = "#stackup-internal-root";
const INTERNAL_HEADER_SELECTOR = ".stackup-internal-brand-header";
const FONT_FAMILY = 'var(--font-love-ya-like-a-sister), "Love Ya Like A Sister", cursive';
const INTERNAL_BLUE = "#23B8FF";
const INTERNAL_WHITE = "#FFFFFF";
const INTERNAL_TITLE_SIZE = "18px";
const INTERNAL_TEXT_SIZE = "14px";

const TITLE_RE = /(^|[\s_-])(title|heading|prompt|question)([\s_-]|$)/i;
const SUBTITLE_RE = /(^|[\s_-])(subtitle|lead|status|count)([\s_-]|$)/i;
const SECONDARY_RE = /(^|[\s_-])(description|helper|hint|caption|secondary|eyebrow|tag|meta|participants|label|kicker)([\s_-]|$)/i;
const TEXT_RE = /(^|[\s_-])(title|heading|prompt|question|subtitle|lead|status|count|description|helper|hint|caption|secondary|eyebrow|tag|meta|participants|label|kicker)([\s_-]|$)/i;

function shouldPreserveCase(node: Node) {
  const element = node instanceof Element ? node : node.parentElement;
  return Boolean(element?.closest(PRESERVE_CASE_SELECTOR));
}

function hasManualTypeScale(element: Element) {
  return Boolean(element.closest(MANUAL_TYPE_SCALE_SELECTOR));
}

function getInternalRoot(element: Element) {
  const direct = element.closest(INTERNAL_ROOT_SELECTOR);
  if (direct) return direct;
  const root = element.getRootNode();
  if (root instanceof ShadowRoot) return root.host.closest(INTERNAL_ROOT_SELECTOR);
  return null;
}

function isInternalTitle(element: HTMLElement) {
  if (/^H[1-6]$/.test(element.tagName)) return true;
  const className = element.getAttribute("class") ?? "";
  return TITLE_RE.test(className) || /(^|[\s_-])eyebrow([\s_-]|$)/i.test(className) || className.toLowerCase().includes("module-screen-title");
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
  if (hasManualTypeScale(element)) return null;

  const internalRoot = getInternalRoot(element);
  if (internalRoot) {
    if (element.closest(INTERNAL_HEADER_SELECTOR)) return null;
    if (isInternalTitle(element)) return { size: INTERNAL_TITLE_SIZE, lineHeight: "1.2" };
    return { size: INTERNAL_TEXT_SIZE, lineHeight: "1.35" };
  }

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

function parseBackground(color: string) {
  const match = color.match(/rgba?\((\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)(?:[,\s/]+(\d+(?:\.\d+)?))?\)/i);
  if (!match) return null;
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: match[4] === undefined ? 1 : Number(match[4]) };
}

function isLightBackground(color: string) {
  const parsed = parseBackground(color);
  if (!parsed || parsed.a < 0.2) return false;
  return parsed.r >= 220 && parsed.g >= 220 && parsed.b >= 220;
}

function isSelectedControl(element: Element) {
  const button = element.closest("button");
  if (button) {
    if (button.getAttribute("aria-pressed") === "true" || button.getAttribute("aria-selected") === "true") return true;
    if (button.classList.contains("primary") || button.classList.contains("active") || button.classList.contains("selected")) return true;
    const className = button.getAttribute("class") ?? "";
    if (/(^|[\s_-])(active|selected)([\s_-]|$)/i.test(className)) return true;
  }
  const label = element.closest("label");
  return Boolean(label?.querySelector('input:checked'));
}

function controlTextColor(element: Element) {
  const control = element.closest("button,a,input,textarea,select,label");
  if (!control || !(control instanceof HTMLElement)) return null;
  if (isSelectedControl(element)) return INTERNAL_WHITE;
  const background = getComputedStyle(control).backgroundColor;
  return isLightBackground(background) ? INTERNAL_BLUE : INTERNAL_WHITE;
}

function isInsideLightSurface(element: Element) {
  const internalRoot = getInternalRoot(element);
  if (!internalRoot) return false;

  let current: Element | null = element;
  while (current && current !== internalRoot) {
    if (current instanceof HTMLElement && isLightBackground(getComputedStyle(current).backgroundColor)) return true;
    if (current.parentElement) {
      current = current.parentElement;
      continue;
    }
    const root = current.getRootNode();
    if (root instanceof ShadowRoot) {
      current = root.host;
      continue;
    }
    break;
  }
  return false;
}

function applyInternalTextPalette(element: Element) {
  if (!(element instanceof HTMLElement || element instanceof SVGElement)) return;
  if (!getInternalRoot(element)) return;

  let color = INTERNAL_WHITE;

  if (element.matches(".stackup-internal-brand-heroes")) {
    color = INTERNAL_BLUE;
  } else if (element.matches(".stackup-internal-brand-name,.stackup-internal-brand-subtitle")) {
    color = INTERNAL_WHITE;
  } else if (element instanceof HTMLElement && isInternalTitle(element)) {
    color = INTERNAL_BLUE;
  } else {
    const controlColor = controlTextColor(element);
    if (controlColor) color = controlColor;
    else if (isInsideLightSurface(element)) color = INTERNAL_BLUE;
  }

  element.style.setProperty("color", color, "important");
  element.style.setProperty("-webkit-text-fill-color", color, "important");
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
  applyInternalTextPalette(element);
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

    const enforce = window.setInterval(() => enforceTree(document.body), 300);

    return () => {
      observer.disconnect();
      window.clearInterval(enforce);
    };
  }, []);

  return null;
}

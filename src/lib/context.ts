import type { SelectionData, SelectionRect } from "./types";

const BLOCK_TAGS = new Set([
  "P",
  "ARTICLE",
  "SECTION",
  "DIV",
  "LI",
  "TD",
  "TH",
  "BLOCKQUOTE",
  "MAIN",
  "ASIDE"
]);

const MAX_CONTEXT_CHARS = 2000;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function findNearestBlockElement(startNode: Node): HTMLElement | null {
  let current: Node | null = startNode;
  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const element = current as HTMLElement;
      if (BLOCK_TAGS.has(element.tagName)) {
        return element;
      }
    }
    current = current.parentNode;
  }
  return document.body;
}

function toPlainRect(rect: DOMRect): SelectionRect {
  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
    width: rect.width,
    height: rect.height
  };
}

function bestRangeRect(range: Range): DOMRect {
  const rect = range.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    return rect;
  }
  const clientRects = range.getClientRects();
  if (clientRects.length > 0) {
    return clientRects[0];
  }
  return rect;
}

function trimContextAroundSelection(contextText: string, selectedText: string): string {
  if (contextText.length <= MAX_CONTEXT_CHARS) {
    return contextText;
  }

  const lowerContext = contextText.toLowerCase();
  const lowerSelection = selectedText.toLowerCase();
  const selectedIndex = lowerContext.indexOf(lowerSelection);
  if (selectedIndex === -1) {
    return contextText.slice(0, MAX_CONTEXT_CHARS).trim();
  }

  const sideRoom = Math.max(0, Math.floor((MAX_CONTEXT_CHARS - selectedText.length) / 2));
  let start = Math.max(0, selectedIndex - sideRoom);
  let end = Math.min(contextText.length, start + MAX_CONTEXT_CHARS);

  if (end - start < MAX_CONTEXT_CHARS) {
    start = Math.max(0, end - MAX_CONTEXT_CHARS);
  }

  return contextText.slice(start, end).trim();
}

export function extractSelectionData(): SelectionData | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  const selectedText = normalizeText(selection.toString());
  if (!selectedText) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const rect = toPlainRect(bestRangeRect(range));

  const rootNode = range.commonAncestorContainer;
  const blockElement = findNearestBlockElement(rootNode);
  const blockText = normalizeText(blockElement?.innerText || blockElement?.textContent || "");
  const paragraphContext = trimContextAroundSelection(blockText, selectedText);

  return {
    selectedText,
    paragraphContext: paragraphContext || selectedText,
    rect
  };
}

import { useEffect } from "react";
import mermaid from "mermaid";

const BLOCK_SELECTOR = [
  ".rp-codeblock.language-mermaid",
  "pre[data-lang='mermaid']",
  "pre code.language-mermaid",
].join(", ");

function resolveContainer(el: Element): HTMLElement {
  const codeblock = el.closest<HTMLElement>(".rp-codeblock");
  if (codeblock) {
    return codeblock;
  }
  if (el instanceof HTMLElement && el.matches("pre")) {
    return el;
  }
  return (el.closest("pre") as HTMLElement | null) ?? (el as HTMLElement);
}

function resolveSource(container: HTMLElement): string {
  const code =
    container.querySelector("pre code") ??
    container.querySelector("code") ??
    container;
  return code.textContent?.trim() ?? "";
}

function collectMermaidContainers(root: ParentNode): HTMLElement[] {
  const seen = new Set<HTMLElement>();
  const result: HTMLElement[] = [];

  for (const el of root.querySelectorAll(BLOCK_SELECTOR)) {
    const container = resolveContainer(el);
    if (
      seen.has(container) ||
      container.closest("[data-mermaid-rendered='true']") ||
      container.getAttribute("data-mermaid-rendered") === "true"
    ) {
      continue;
    }
    const source = resolveSource(container);
    if (!source) {
      continue;
    }
    seen.add(container);
    result.push(container);
  }

  return result;
}

async function renderMermaidBlocks(root: ParentNode = document): Promise<void> {
  const blocks = collectMermaidContainers(root);
  if (blocks.length === 0) {
    return;
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "neutral",
  });

  for (const [index, container] of blocks.entries()) {
    const source = resolveSource(container);
    const host = document.createElement("div");
    host.className = "mermaid-diagram";
    host.setAttribute("data-mermaid-rendered", "true");

    try {
      const id = `mermaid-${Date.now()}-${index}`;
      const { svg } = await mermaid.render(id, source);
      host.innerHTML = svg;
      container.replaceWith(host);
    } catch (error) {
      host.classList.add("mermaid-diagram--error");
      host.textContent =
        error instanceof Error ? error.message : "Mermaid render failed";
      container.replaceWith(host);
    }
  }
}

/**
 * Client-side Mermaid renderer for ```mermaid fences (Rspress 2 Shiki DOM).
 */
export default function MermaidRuntime(): null {
  useEffect(() => {
    void renderMermaidBlocks();

    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) {
        return;
      }
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        void renderMermaidBlocks();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}

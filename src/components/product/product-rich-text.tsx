import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : part,
  );
}

/** Renders the small Markdown subset used by imported product copy without raw HTML. */
export function ProductRichText({ content, className = "" }: { content: string; className?: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (!list.length) return;
    blocks.push(<ul key={`list-${blocks.length}`} className="list-disc space-y-1 pl-5">{list.map((item, index) => <li key={index}>{inline(item)}</li>)}</ul>);
    list = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      list.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }
    flushList();
    if (/^###\s+/.test(line)) {
      blocks.push(<h3 key={blocks.length} className="pt-2 text-base font-bold text-ink">{inline(line.replace(/^###\s+/, ""))}</h3>);
    } else if (/^##\s+/.test(line)) {
      blocks.push(<h2 key={blocks.length} className="pt-2 text-lg font-bold text-ink">{inline(line.replace(/^##\s+/, ""))}</h2>);
    } else {
      blocks.push(<p key={blocks.length}>{inline(line)}</p>);
    }
  }
  flushList();

  return <div className={`space-y-3 ${className}`.trim()}>{blocks}</div>;
}

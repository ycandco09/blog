"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/markdown";

interface TOCProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TOCProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="文章目录" className="text-sm">
      <h4 className="font-semibold mb-3">目录</h4>
      <ul className="space-y-1.5 border-l-2 border-[var(--color-border)] pl-3">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
          >
            <a
              href={`#${heading.id}`}
              className={`block py-0.5 transition-colors ${
                activeId === heading.id
                  ? "text-blue-600 font-medium"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

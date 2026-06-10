"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface SearchEntry {
  id: number;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  type: string;
  excerpt: string;
  content: string;
}

export function SearchPage() {
  const [searchData, setSearchData] = useState<SearchEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/search-index.json");
        const data: SearchEntry[] = await res.json();
        setSearchData(data);
      } catch {
        console.warn("搜索索引加载失败");
      }
    })();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = useCallback(
    (q: string) => {
      if (!searchData || !q.trim()) {
        setResults([]);
        return;
      }

      const keywords = q.toLowerCase().split(/\s+/).filter(Boolean);

      const matched = searchData
        .filter((entry) => {
          const searchText = [
            entry.title,
            entry.excerpt,
            entry.content,
            entry.category,
            ...entry.tags,
          ]
            .join(" ")
            .toLowerCase();

          return keywords.every((kw) => searchText.includes(kw));
        })
        .slice(0, 20);

      // 按匹配度排序：标题匹配优先
      matched.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(keywords[0]) ? 1 : 0;
        const bTitle = b.title.toLowerCase().includes(keywords[0]) ? 1 : 0;
        return bTitle - aTitle;
      });

      setResults(matched);
    },
    [searchData]
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">🔍 搜索</h1>

      <div className="relative mb-8">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="搜索文章..."
          className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)]
            bg-[var(--color-bg-card)] focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {!searchData && (
        <p className="text-[var(--color-text-secondary)] text-center py-8">
          正在加载搜索索引...
        </p>
      )}

      {results.length === 0 && query && searchData && (
        <p className="text-[var(--color-text-secondary)] text-center py-8">
          未找到相关内容
        </p>
      )}

      <div className="space-y-6">
        {results.map((entry) => (
          <Link
            key={entry.id}
            href={`/blog/${entry.category}/${entry.slug}`}
            className="block p-4 border border-[var(--color-border)]
              hover:border-blue-500 transition-colors"
            style={{ borderRadius: "8px" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                {entry.category}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {entry.type}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">{entry.title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
              {entry.excerpt}
            </p>
            <div className="flex gap-1.5 mt-2">
              {entry.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs text-[var(--color-text-secondary)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

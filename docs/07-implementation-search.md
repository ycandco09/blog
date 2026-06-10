# 搜索系统实现方案 + 代码解析

## 一、模块概览

搜索系统完全在构建时生成索引 + 客户端运行时查询，遵循零后端架构。

**技术选型**：flexsearch（~10KB gzip）

**流程**：
```
构建时：扫描所有文章 → 生成 flexsearch 索引 → 导出 JSON → 写入 public/search-index.json
运行时：加载 search-index.json → 用户输入查询 → flexsearch.search() → 渲染结果
```

---

## 二、搜索索引数据结构

### 2.1 search-index.json 格式

```json
[
  {
    "id": 1,
    "title": "堆溢出利用基础",
    "slug": "heap-overflow-basic",
    "category": "Pwn",
    "tags": ["heap", "glibc", "pwn"],
    "type": "note",
    "excerpt": "本文介绍glibc堆管理器中堆溢出的基本原理...",
    "content": "## 概述\n\n堆溢出是二进制漏洞利用中...(截断2000字)"
  },
  ...
]
```

### 2.2 索引内容策略

| 字段 | 用途 | 长度 |
|------|------|------|
| `title` | 标题匹配 | 完整 |
| `tags` | 标签匹配 | 完整 |
| `excerpt` | 摘要匹配（description） | 完整（≤200字） |
| `content` | 正文全文匹配 | 截断至 2000 字 |

---

## 三、构建时索引生成

```typescript
// lib/search.ts

import FlexSearch from "flexsearch";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogPostSchema } from "./schema";

const MAX_CONTENT_LENGTH = 2000;

export interface SearchEntry {
  id: number;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  type: string;
  excerpt: string;
  content: string;
}

interface RawSearchDocument {
  id: number;
  title: string;
  slug: string;
  category: string;
  tags: string;
  type: string;
  excerpt: string;
  content: string;
}

export function buildSearchIndex(): void {
  const blogDir = path.join(process.cwd(), "content", "blog");
  const entries: SearchEntry[] = [];
  let idCounter = 1;

  // 1. 扫描所有博客文章
  function scan(dir: string, category: string) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        scan(fullPath, item.name);
      } else if (item.name.endsWith(".md")) {
        const raw = fs.readFileSync(fullPath, "utf-8");
        const { data, content } = matter(raw);

        const parsed = BlogPostSchema.safeParse(data);
        if (!parsed.success || parsed.data.draft) return;

        entries.push({
          id: idCounter++,
          title: parsed.data.title,
          slug: parsed.data.slug || path.basename(item.name, ".md"),
          category: parsed.data.category,
          tags: parsed.data.tags,
          type: parsed.data.type,
          excerpt: parsed.data.description.slice(0, 200),
          content: content.replace(/\s+/g, " ").trim().slice(0, MAX_CONTENT_LENGTH),
        });
      }
    }
  }

  scan(blogDir, "");

  // 2. 构建 FlexSearch 索引
  const index = new FlexSearch.Document<RawSearchDocument>({
    document: {
      id: "id",
      index: ["title", "tags", "content", "excerpt", "category"],
      store: ["title", "slug", "category", "tags", "type", "excerpt"],
    },
    tokenize: "forward",
    encode: "balance",   // 平衡中文+英文分词
    cache: true,
  });

  for (const entry of entries) {
    index.add({
      ...entry,
      tags: entry.tags.join(" "),
    });
  }

  // 3. 导出索引
  const exported = index.export();
  const indexPath = path.join(process.cwd(), "public", "search-index.json");
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });

  // 存储 entries 用于结果展示 + 序列化的 flexsearch 索引用于查询
  fs.writeFileSync(
    indexPath,
    JSON.stringify({
      entries,
      index: exported,
    })
  );

  console.log(`[search] 搜索索引已生成: ${entries.length} 条记录`);
}
```

---

## 四、客户端搜索组件

### 4.1 搜索页

```tsx
// app/search/page.tsx

import { SearchPage } from "@/components/SearchPage";

export const metadata = {
  title: "搜索",
};

export default function Page() {
  return <SearchPage />;
}
```

### 4.2 SearchPage 组件

```tsx
// components/SearchPage.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import FlexSearch from "flexsearch";
import Link from "next/link";
import type { SearchEntry } from "@/lib/search";

interface SearchData {
  entries: SearchEntry[];
  index: ReturnType<FlexSearch.Document<unknown>["export"]>;
}

export function SearchPage() {
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载索引文件
  useEffect(() => {
    (async () => {
      const res = await fetch("/search-index.json");
      const data: SearchData = await res.json();
      setSearchData(data);
    })();
  }, []);

  // 执行搜索
  const handleSearch = useCallback(
    async (q: string) => {
      if (!searchData || !q.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);

      const index = new FlexSearch.Document({
        document: {
          id: "id",
          index: ["title", "tags", "content", "excerpt", "category"],
          store: ["title", "slug", "category", "tags", "type", "excerpt"],
        },
        tokenize: "forward",
        encode: "balance",
      });

      // 导入预构建索引
      (index as any).import(searchData.index);

      const found = index.search(q, { limit: 20, enrich: true });

      // 去重并按 ID 获取完整记录
      const foundIds = Array.from(
        new Set((found as any[]).flatMap((f) => f.result.map((r: any) => r)))
      );

      const matched = searchData.entries.filter((e) => foundIds.includes(e.id));
      setResults(matched);
      setLoading(false);
    },
    [searchData]
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">🔍 搜索</h1>

      <div className="relative mb-8">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="搜索文章..."
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            搜索中...
          </span>
        )}
      </div>

      {results.length === 0 && query && !loading && (
        <p className="text-gray-500 text-center py-8">未找到相关内容</p>
      )}

      <div className="space-y-6">
        {results.map((entry) => (
          <Link
            key={entry.id}
            href={`/blog/${entry.category}/${entry.slug}`}
            className="block p-4 rounded-lg border border-gray-200 dark:border-gray-800
              hover:border-blue-500 transition-colors"
            style={{ borderRadius: "8px" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                {entry.category}
              </span>
              <span className="text-xs text-gray-500">{entry.type}</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">{entry.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {entry.excerpt}
            </p>
            <div className="flex gap-1.5 mt-2">
              {entry.tags.map((tag) => (
                <span key={tag} className="text-xs text-gray-400">#{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

### 4.3 导航栏搜索快捷入口

```tsx
// components/SearchButton.tsx

import Link from "next/link";

export function SearchButton() {
  return (
    <Link
      href="/search"
      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg
        border border-gray-200 dark:border-gray-800
        text-gray-500 dark:text-gray-400
        hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
      aria-label="打开搜索"
    >
      <span>🔍</span>
      <span className="hidden sm:inline">搜索</span>
      <kbd className="hidden md:inline text-xs px-1.5 py-0.5 rounded
        bg-gray-100 dark:bg-gray-800">Ctrl+K</kbd>
    </Link>
  );
}
```

---

## 五、代码解析

### 5.1 flexsearch 编码策略

```
tokenize: "forward"   → 前缀搜索，支持渐进式匹配（输入"heap"匹配"heap overflow"）
encode: "balance"     → 混合中文+英文场景最佳，避免纯英文分词导致中文搜索失效
cache: true           → 缓存分词结果，提升重复搜索性能
```

### 5.2 索引大小控制

```typescript
const MAX_CONTENT_LENGTH = 2000;   // 正文截断
// 预估：100 篇 × 2000 字 ≈ 200KB 原始文本 → 索引序列化约 50-100KB
```

### 5.3 构建集成

在 `next.config.mjs` 或 `scripts/build-search.ts` 中：

```typescript
// scripts/build-search.ts
import { buildSearchIndex } from "../lib/search";

console.log("[build] 开始生成搜索索引...");
buildSearchIndex();
console.log("[build] 搜索索引生成完成");
```

---

## 六、关键文件清单

| 文件路径 | 功能 |
|---------|------|
| `lib/search.ts` | 构建时搜索索引生成 |
| `app/search/page.tsx` | 搜索页面入口 |
| `components/SearchPage.tsx` | 搜索客户端组件（加载索引+搜索） |
| `components/SearchButton.tsx` | 导航栏搜索入口 |
| `public/search-index.json` | 预构建搜索索引（构建产物） |

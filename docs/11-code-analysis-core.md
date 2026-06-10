# 核心工具库代码解析

## 一、模块概览

`lib/` 目录是项目的数据中枢，负责 Markdown 文件读取、解析、校验和搜索索引生成。

```
lib/
├── content.ts        # 内容读取与聚合
├── markdown.ts       # unified 管线配置
├── search.ts         # 搜索索引生成
├── schema.ts         # Zod 数据校验
├── breadcrumb.ts     # 面包屑数据
└── utils.ts          # 通用工具函数
```

---

## 二、content.ts —— 内容读取核心

### 2.1 函数依赖关系

```
getAllPosts()  ← 扫描 content/blog/ 递归读 .md → gray-matter 解析 → Zod 校验
       │
       ├── getPublishedPosts()  ← 过滤 draft + 生产环境隐藏
       │       │
       │       ├── getPost(category, slug)  ← 单篇文章获取 + markdown 渲染
       │       │       │
       │       │       └── renderMarkdown()  (来自 markdown.ts)
       │       │
       │       └── getSeriesPosts(seriesName)  ← 系列文章获取
       │
       └── getFeaturedPosts()   ← 精选文章（featured: true）
```

### 2.2 核心实现

```typescript
// lib/content.ts

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogPostSchema, MaterialSchema, ResumeSchema } from "./schema";
import { renderMarkdown, extractHeadings } from "./markdown";
import type { BlogPost, Material, Resume } from "./schema";
import type { Heading } from "./markdown";

// ========== 通用扫描函数 ==========

function getMdFiles(dir: string): string[] {
  const results: string[] = [];

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(".md")) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

// ========== 博客文章 ==========

export function getAllPosts(): (BlogPost & { slug: string; filePath: string })[] {
  const blogDir = path.join(process.cwd(), "content", "blog");
  const files = getMdFiles(blogDir);
  const results: (BlogPost & { slug: string; filePath: string })[] = [];

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);

    const parsed = BlogPostSchema.safeParse(data);
    if (!parsed.success) {
      console.warn(`[schema] 文章校验失败: ${filePath}`);
      console.warn(parsed.error.format());
      continue;
    }

    const slug = resolveSlug(filePath, parsed.data);
    const category = path.basename(path.dirname(filePath));

    results.push({ ...parsed.data, slug, category, filePath });
  }

  return results;
}

export function getPublishedPosts() {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => {
    if (post.draft && process.env.NODE_ENV === "production") {
      console.log(`[draft] 跳过: ${post.slug}`);
      return false;
    }
    return true;
  });
}

export async function getPost(
  category: string,
  slug: string
): Promise<ParsedBlogPost | null> {
  const posts = getPublishedPosts();
  const post = posts.find((p) => p.category === category && p.slug === slug);
  if (!post) return null;

  const raw = fs.readFileSync(post.filePath, "utf-8");
  const { content } = matter(raw);
  const html = await renderMarkdown(content);
  const headings = extractHeadings(html);

  const wordCount = content.replace(/\s/g, "").length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 300));

  return { ...post, html, headings, readingTime, wordCount };
}

// ========== 资料库 ==========

export function getAllMaterials(): (Material & { slug: string })[] {
  const materialsDir = path.join(process.cwd(), "content", "materials");
  const files = getMdFiles(materialsDir);
  const results: (Material & { slug: string })[] = [];

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);

    const parsed = MaterialSchema.safeParse(data);
    if (!parsed.success) {
      console.warn(`[schema] 资料校验失败: ${filePath}`);
      continue;
    }

    results.push({
      ...parsed.data,
      slug: path.basename(filePath, ".md"),
    });
  }

  return results;
}

// ========== 简历 ==========

export function getResume(): Resume {
  const filePath = path.join(process.cwd(), "content", "resume.md");

  if (!fs.existsSync(filePath)) {
    console.warn("[resume] resume.md 不存在，返回默认值");
    return ResumeSchema.parse({ name: "待填写", title: "" });
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);

  const parsed = ResumeSchema.safeParse(data);
  if (!parsed.success) {
    console.warn("[resume] 简历数据校验失败");
    console.warn(parsed.error.format());
    return ResumeSchema.parse({ name: "待填写", title: "" });
  }

  return parsed.data;
}

// ========== Slug 解析 ==========

export function resolveSlug(
  filePath: string,
  frontmatter: { slug?: string }
): string {
  if (frontmatter.slug) return frontmatter.slug;
  return path.basename(filePath, ".md");
}

// ========== 类型导出 ==========

export interface ParsedBlogPost extends BlogPost {
  slug: string;
  html: string;
  headings: Heading[];
  readingTime: number;
  wordCount: number;
}
```

---

## 三、markdown.ts —— unified 管线

```typescript
// lib/markdown.ts

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

export interface Heading {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export async function renderMarkdown(mdContent: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)                                    // Markdown → AST
    .use(remarkGfm)                                      // 表格、任务列表、删除线
    .use(remarkMath)                                     // $...$ 数学公式
    .use(remarkRehype, { allowDangerousHtml: false })    // Markdown AST → HTML AST（禁止原始 HTML）
    .use(rehypeKatex)                                    // KaTeX 数学渲染
    .use(rehypeHighlight)                                // 代码高亮
    .use(rehypeSlug)                                     // 标题添加 id
    .use(rehypeSanitize)                                 // XSS 防护
    .use(rehypeStringify)                                // HTML AST → HTML 字符串
    .process(mdContent);

  return String(result.value);
}

export function extractHeadings(html: string): Heading[] {
  // 匹配 rehype-slug 生成的带 id 的标题
  const regex = /<h([2-4])\s+id="([^"]+)"[^>]*>(.*?)<\/h\1>/g;
  const headings: Heading[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]) as 1 | 2 | 3 | 4,
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, "").trim(),
    });
  }

  return headings;
}
```

### 管线流程图

```
输入: Markdown 字符串
  │
  ├── remarkParse      → mdast (Markdown AST)
  ├── remarkGfm        → 新增 GFM 节点（table, taskList, strikethrough）
  ├── remarkMath       → 新增 math/inlineMath 节点
  ├── remarkRehype     → hast (HTML AST) | allowDangerousHtml: false
  ├── rehypeKatex      → math 节点 → KaTeX HTML
  ├── rehypeHighlight  → code 节点 → <pre><code class="hljs">
  ├── rehypeSlug       → h1-h6 节点添加 id 属性
  ├── rehypeSanitize   → 删除危险标签（script, iframe, onclick等）
  └── rehypeStringify  → HTML 字符串
  │
输出: 安全的 HTML 字符串
```

---

## 四、search.ts —— 搜索索引

（详见 `07-implementation-search.md`，此处仅附核心结构）

```typescript
// lib/search.ts 核心结构

import FlexSearch from "flexsearch";

export function buildSearchIndex(): void {
  // 1. 扫描 content/blog/ 下所有文章
  // 2. gray-matter 解析 + Zod 校验 + draft 过滤
  // 3. 构建 SearchEntry[] 数组
  // 4. 创建 FlexSearch.Document 索引
  // 5. index.add() 逐个添加文档
  // 6. index.export() 导出序列化数据
  // 7. 写入 public/search-index.json
}
```

---

## 五、schema.ts —— 数据校验

（详见 `02-content-model.md`，此处仅附核心结构）

```typescript
// lib/schema.ts 核心结构

import { z } from "zod";

export const BlogPostSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  // ... 完整字段见 02-content-model.md
});

export const MaterialSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(200),
  file_path: z.string().startsWith("/materials/"),
  size: z.string().regex(/^\d+(\.\d+)?(KB|MB|GB)$/),
  // ...
});

export const ResumeSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  skills: z.array(z.object({
    name: z.string(),
    items: z.array(z.string()),
  })),
  // ...
});
```

---

## 六、breadcrumb.ts

```typescript
// lib/breadcrumb.ts

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getPostBreadcrumbs(
  category: string,
  postTitle: string
): BreadcrumbItem[] {
  return [
    { name: "首页", url: "/" },
    { name: "博客", url: "/blog" },
    { name: category, url: `/blog/${category}` },
    { name: postTitle, url: "#" },
  ];
}

export function getCategoryBreadcrumbs(category: string): BreadcrumbItem[] {
  return [
    { name: "首页", url: "/" },
    { name: "博客", url: "/blog" },
    { name: category, url: `/blog/${category}` },
  ];
}
```

---

## 七、utils.ts

```typescript
// lib/utils.ts

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "...";
}
```

---

## 八、关键文件清单

| 文件路径 | 职责 |
|---------|------|
| `lib/content.ts` | 内容读取、聚合、slug 解析、draft 过滤 |
| `lib/markdown.ts` | unified 管线、renderMarkdown()、extractHeadings() |
| `lib/search.ts` | FlexSearch 索引构建 |
| `lib/schema.ts` | Zod 数据模型校验 |
| `lib/breadcrumb.ts` | 面包屑数据生成 |
| `lib/utils.ts` | formatDate、truncate 等工具函数 |

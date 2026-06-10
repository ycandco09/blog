# 博客模块实现方案 + 代码解析

## 一、模块概览

博客模块是核心功能模块，包含 3 个页面和多个子组件：

| 页面 | 路由 | 功能 |
|------|------|------|
| 博客列表页 | `/blog` | 全部博客文章展示 + 分页 |
| 博客分类页 | `/blog/[category]` | 按分类筛选 + 分页 |
| 文章详情页 | `/blog/[category]/[slug]` | 文章渲染 + TOC + 进度条 + 面包屑 + Schema |

---

## 二、文章列表页实现（/blog）

### 2.1 页面组件

```tsx
// app/blog/page.tsx

import Link from "next/link";
import { getPublishedPosts } from "@/lib/content";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";

const POSTS_PER_PAGE = 10;

export default function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const posts = getPublishedPosts()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentPage = Number(searchParams.page) || 1;
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">博客</h1>

      <div className="grid gap-6">
        {paginatedPosts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </main>
  );
}
```

### 2.2 PostCard 组件

```tsx
// components/PostCard.tsx

import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/schema";
import { categories } from "@/config/categories";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: BlogPost & { slug: string };
}

export function PostCard({ post }: PostCardProps) {
  const categoryConfig = categories[post.category] || {
    icon: "📄",
    color: "#666",
  };

  return (
    <Link
      href={`/blog/${post.category}/${post.slug}`}
      className="block p-6 rounded-lg border border-gray-200 dark:border-gray-800
        hover:translate-y-[-2px] transition-transform duration-200
        bg-white dark:bg-[#0a0c10]"
      style={{ borderRadius: "8px" }}
    >
      <div className="flex gap-4">
        {post.cover && (
          <div className="flex-shrink-0 w-48 h-32 relative overflow-hidden rounded-md">
            <Image
              src={post.cover}
              alt={post.title}
              fill
              className="object-cover"
              sizes="192px"
              placeholder="blur"
              blurDataURL={post.blurDataURL}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${categoryConfig.color}20`,
                color: categoryConfig.color,
              }}
            >
              {categoryConfig.icon} {post.category}
            </span>
            {post.difficulty && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {post.difficulty}
              </span>
            )}
            {post.type === "writeup" && (
              <span className="text-xs text-orange-500">Writeup</span>
            )}
          </div>

          <h2 className="text-xl font-semibold mb-1 truncate">{post.title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {post.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <div className="flex gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="hover:text-blue-500">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

### 2.3 分页组件

```typescript
// components/Pagination.tsx

import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  return (
    <nav className="flex justify-center gap-2 mt-8" aria-label="分页导航">
      {currentPage > 1 && (
        <Link
          href={`/blog?page=${currentPage - 1}`}
          className="px-4 py-2 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          上一页
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={`/blog?page=${page}`}
          className={`px-4 py-2 rounded-md border ${
            page === currentPage
              ? "bg-blue-600 text-white border-blue-600"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={`/blog?page=${currentPage + 1}`}
          className="px-4 py-2 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          下一页
        </Link>
      )}
    </nav>
  );
}
```

---

## 三、分类列表页实现（/blog/[category]）

```tsx
// app/blog/[category]/page.tsx

import { notFound } from "next/navigation";
import { getPublishedPosts } from "@/lib/content";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { categories } from "@/config/categories";

export async function generateStaticParams() {
  const posts = getPublishedPosts();
  return Array.from(new Set(posts.map((p) => p.category))).map((category) => ({
    category,
  }));
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { page?: string };
}) {
  const categoryConfig = categories[params.category];

  if (!categoryConfig) {
    notFound();
  }

  const posts = getPublishedPosts()
    .filter((p) => p.category === params.category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (posts.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">
          {categoryConfig.icon} {params.category}
        </h1>
        <p className="text-gray-500">该分类下暂无文章</p>
      </main>
    );
  }

  const currentPage = Number(searchParams.page) || 1;
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">
        {categoryConfig.icon} {params.category}
      </h1>
      <p className="text-gray-500 mb-8">{categoryConfig.description}</p>

      <div className="grid gap-6">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </main>
  );
}
```

---

## 四、文章详情页实现（/blog/[category]/[slug]）

### 4.1 页面核心结构

```tsx
// app/blog/[category]/[slug]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPost, getPublishedPosts } from "@/lib/content";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { ArticleSchema } from "@/components/ArticleSchema";
import { PostHeader } from "@/components/PostHeader";
import { TableOfContents } from "@/components/TableOfContents";
import { ReadingProgress } from "@/components/ReadingProgress";
import { MarkdownBody } from "@/components/MarkdownBody";
import { SeriesNav } from "@/components/SeriesNav";
import { getPostBreadcrumbs } from "@/lib/breadcrumb";

export async function generateStaticParams() {
  return getPublishedPosts().map((post) => ({
    category: post.category,
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.category, params.slug);
  if (!post) return { title: "文章不存在" };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
      tags: post.tags,
      ...(post.cover ? { images: [{ url: post.cover }] } : {}),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const post = await getPost(params.category, params.slug);

  if (!post) notFound();

  const breadcrumbs = getPostBreadcrumbs(post.category, post.title);

  return (
    <>
      <ArticleSchema post={post} />
      <BreadcrumbSchema items={breadcrumbs} />

      <ReadingProgress />

      <article className="max-w-4xl mx-auto px-4 py-8">
        <BreadcrumbNav items={breadcrumbs} />
        <PostHeader post={post} />

        <div className="flex gap-8 mt-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <TableOfContents headings={post.headings} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <MarkdownBody html={post.html} />
          </div>
        </div>

        {post.series && <SeriesNav post={post} />}
      </article>
    </>
  );
}
```

### 4.2 阅读进度条组件

```tsx
// components/ReadingProgress.tsx
"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const totalScroll = docHeight - winHeight;

      if (totalScroll <= 0) {
        setProgress(100);
        return;
      }

      setProgress(Math.min((scrollTop / totalScroll) * 100, 100));
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-0.5 z-50 bg-gray-200 dark:bg-gray-800">
      <div
        className="h-full bg-blue-600 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="阅读进度"
      />
    </div>
  );
}
```

### 4.3 TOC 组件

```tsx
// components/TableOfContents.tsx
"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/content";

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
      <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
        目录
      </h4>
      <ul className="space-y-1.5 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
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
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
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
```

### 4.4 面包屑导航组件

```tsx
// components/BreadcrumbNav.tsx

import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="面包屑导航" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        {items.map((item, index) => (
          <li key={item.url} className="flex items-center gap-2">
            {index > 0 && <span>/</span>}
            {index < items.length - 1 ? (
              <Link href={item.url} className="hover:text-blue-600 transition-colors">
                {item.name}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// components/BreadcrumbSchema.tsx
interface BreadcrumbItem {
  name: string;
  url: string;
}

const BASE_URL = "https://your-domain.com";

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### 4.5 文章头部组件

```tsx
// components/PostHeader.tsx

import type { ParsedBlogPost } from "@/lib/content";
import { categories } from "@/config/categories";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

export function PostHeader({ post }: { post: ParsedBlogPost }) {
  const catConfig = categories[post.category];
  const difficultyLabels: Record<string, string> = {
    easy: "入门",
    medium: "中级",
    hard: "困难",
    expert: "专家",
  };

  return (
    <header className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-500 dark:text-gray-400">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {post.updated && <time dateTime={post.updated}>更新于 {formatDate(post.updated)}</time>}
        <span>·</span>
        <span>{post.readingTime} 分钟阅读</span>
        <span>·</span>
        <span>{post.wordCount} 字</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {catConfig && (
          <span
            className="px-3 py-1 rounded-full text-sm"
            style={{
              backgroundColor: `${catConfig.color}20`,
              color: catConfig.color,
            }}
          >
            {catConfig.icon} {catConfig.description}
          </span>
        )}
        {post.difficulty && (
          <span className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800">
            {difficultyLabels[post.difficulty] || post.difficulty}
          </span>
        )}
        {post.type === "writeup" && post.competition && (
          <span className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            🏆 {post.competition}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs rounded-md bg-gray-100 dark:bg-gray-800
              text-gray-600 dark:text-gray-400"
          >
            #{tag}
          </span>
        ))}
      </div>

      {post.cover && (
        <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden mb-6">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            className="object-cover"
            priority
            placeholder="blur"
            blurDataURL={post.blurDataURL}
          />
        </div>
      )}
    </header>
  );
}
```

### 4.6 MarkdownBody 组件（文章内图片渐进式加载）

```tsx
// components/MarkdownBody.tsx

import Image from "next/image";
import { useMemo } from "react";

interface MarkdownBodyProps {
  html: string;
}

export function MarkdownBody({ html }: MarkdownBodyProps) {
  const processedHtml = useMemo(() => {
    return html.replace(
      /<img\s+src="([^"]+)"\s+alt="([^"]*)"\s*\/?>/g,
      (_match, src, alt) => {
        const imgPath = src.replace(/^\/images\/posts\//, "");
        return `<span class="block my-6">
          <img
            src="${src}"
            alt="${alt}"
            loading="lazy"
            class="w-full rounded-lg"
            style="background: #f3f4f6"
          />
          ${alt ? `<span class="block text-center text-sm text-gray-500 mt-2">${alt}</span>` : ""}
        </span>`;
      }
    );
  }, [html]);

  return (
    <div
      className="prose prose-gray dark:prose-invert max-w-none
        prose-headings:scroll-mt-20
        prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950
        prose-code:font-jetbrains prose-code:text-sm
        prose-img:rounded-lg
        prose-table:border-collapse
        prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700
        prose-th:px-4 prose-th:py-2
        prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700
        prose-td:px-4 prose-td:py-2
        prose-a:text-blue-600 dark:prose-a:text-blue-400"
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}
```

### 4.7 系列导航组件

```tsx
// components/SeriesNav.tsx

import Link from "next/link";
import type { ParsedBlogPost } from "@/lib/content";
import { getPublishedPosts } from "@/lib/content";

export function SeriesNav({ post }: { post: ParsedBlogPost }) {
  const seriesPosts = getPublishedPosts()
    .filter((p) => p.series === post.series)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (seriesPosts.length <= 1) return null;

  const currentIndex = seriesPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : null;

  return (
    <nav className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"
      aria-label={`${post.series} 系列导航`}>
      <h3 className="text-lg font-semibold mb-4">
        📚 系列文章：{post.series} ({currentIndex + 1}/{seriesPosts.length})
      </h3>

      <div className="flex justify-between gap-4">
        {prevPost ? (
          <Link
            href={`/blog/${prevPost.category}/${prevPost.slug}`}
            className="flex-1 p-4 rounded-lg border hover:border-blue-500 transition-colors"
          >
            <span className="text-sm text-gray-500">← 上一篇</span>
            <p className="font-medium mt-1">{prevPost.title}</p>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextPost ? (
          <Link
            href={`/blog/${nextPost.category}/${nextPost.slug}`}
            className="flex-1 p-4 rounded-lg border hover:border-blue-500 transition-colors text-right"
          >
            <span className="text-sm text-gray-500">下一篇 →</span>
            <p className="font-medium mt-1">{nextPost.title}</p>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </nav>
  );
}
```

---

## 五、代码解析

### 5.1 getPost 函数解析

```typescript
// lib/content.ts

export async function getPost(
  category: string,
  slug: string
): Promise<ParsedBlogPost | null> {
  // 1. 获取所有已发布文章
  const posts = getPublishedPosts();

  // 2. 按 category + slug 精确匹配
  const post = posts.find(
    (p) => p.category === category && p.slug === slug
  );

  if (!post) return null;

  // 3. 读取源文件
  const filePath = path.join(process.cwd(), "content", "blog", category, `${slug}.md`);

  // 如果 slug 是自定义的，需要从 content 映射回真实文件路径
  const realPath = resolveFilePath(filePath, slug);

  // 4. 用 gray-matter 解析
  const fileContent = fs.readFileSync(realPath, "utf-8");
  const { data: frontmatter, content: markdownBody } = matter(fileContent);

  // 5. 用 unified 管线渲染 Markdown → HTML
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)                    // GitHub Flavored Markdown
    .use(remarkMath)                   // 数学公式
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeKatex)                  // KaTeX 渲染
    .use(rehypeHighlight)             // 代码高亮
    .use(rehypeSlug)                  // 标题 id
    .use(rehypeSanitize)              // XSS 防护
    .use(rehypeStringify)
    .process(markdownBody);

  // 6. 提取标题用于 TOC
  const headings = extractHeadings(result.value as string);

  // 7. 计算阅读时间（中文约 300 字/分钟）
  const wordCount = markdownBody.replace(/\s/g, "").length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 300));

  return {
    ...post,
    html: String(result.value),
    headings,
    readingTime,
    wordCount,
  };
}
```

### 5.2 extractHeadings 函数

```typescript
// 从 HTML 中提取 h1-h6 标题信息
function extractHeadings(html: string): Heading[] {
  const headingRegex = /<h([2-4])\s+id="([^"]+)"[^>]*>(.*?)<\/h[2-4]>/g;
  const headings: Heading[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]) as 1 | 2 | 3 | 4,
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, ""),  // 去除内嵌标签
    });
  }

  return headings;
}
```

### 5.3 图片处理管线

```typescript
// 构建脚本中生成封面图的 blurDataURL

import { getPlaiceholder } from "plaiceholder";

export async function generateBlurDataURL(imagePath: string): Promise<string> {
  const file = fs.readFileSync(
    path.join(process.cwd(), "public", imagePath)
  );
  const { base64 } = await getPlaiceholder(file);
  return base64;
}
```

在 `content.ts` 中集成：

```typescript
export async function getAllPostsWithPlaceholders(): Promise<BlogPost[]> {
  const posts = getPublishedPosts();
  return Promise.all(
    posts.map(async (post) => {
      if (!post.cover) return post;
      const blurDataURL = await generateBlurDataURL(post.cover);
      return { ...post, blurDataURL };
    })
  );
}
```

---

## 六、关键实现文件清单

| 文件路径 | 功能 |
|---------|------|
| `app/blog/page.tsx` | 博客列表页（分页） |
| `app/blog/[category]/page.tsx` | 分类列表页 |
| `app/blog/[category]/[slug]/page.tsx` | 文章详情页 + SEO metadata |
| `components/PostCard.tsx` | 文章卡片（封面、标签、分类） |
| `components/PostHeader.tsx` | 文章头部（标题、元信息、封面） |
| `components/MarkdownBody.tsx` | Markdown 渲染体（prose + 图片 lazy） |
| `components/TableOfContents.tsx` | 浮动目录导航（IntersectionObserver） |
| `components/ReadingProgress.tsx` | 页面顶部阅读进度条 |
| `components/BreadcrumbNav.tsx` | 面包屑导航 UI |
| `components/BreadcrumbSchema.tsx` | BreadcrumbList JSON-LD |
| `components/ArticleSchema.tsx` | BlogPosting JSON-LD |
| `components/SeriesNav.tsx` | 系列文章前后导航 |
| `components/Pagination.tsx` | 分页导航 |
| `lib/breadcrumb.ts` | 面包屑数据生成逻辑 |
| `lib/content.ts` | getPost / getPublishedPosts / extractHeadings |
| `lib/markdown.ts` | unified 管线配置 |
| `lib/utils.ts` | formatDate 等工具函数 |

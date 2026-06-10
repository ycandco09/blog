# 首页与关于页实现方案 + 代码解析

## 一、模块概览

| 页面 | 路由 | 核心内容 |
|------|------|---------|
| 首页 | `/` | Hero 区 + 最新博客 + 最新资料 + 分类导航 |
| 关于页 | `/about` | Markdown 渲染的个人介绍 |
| Writeups | `/writeups` | 按比赛分组的 CTF Writeup 汇总 |

---

## 二、首页实现

### 2.1 页面组件

```tsx
// app/page.tsx

import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedPosts, getAllMaterials } from "@/lib/content";
import { categories } from "@/config/categories";
import { PostCard } from "@/components/PostCard";
import { MaterialCard } from "@/components/MaterialCard";

export const metadata: Metadata = {
  title: "安全技术博客",
  description: "网络安全研究者的技术笔记、研究素材归档与专业能力展示",
};

export default function HomePage() {
  const posts = getPublishedPosts()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const featuredPosts = posts.filter((p) => p.featured);

  const materials = getAllMaterials()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <main>
      <HeroSection />

      <div className="max-w-5xl mx-auto px-4">
        {featuredPosts.length > 0 && (
          <section className="py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">⭐ 精选文章</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        <section className="py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">📝 最新博客</h2>
            <Link
              href="/blog"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              查看全部 →
            </Link>
          </div>

          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">📚 最新资料</h2>
            <Link
              href="/materials"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-4">
            {materials.map((m) => (
              <MaterialCard key={m.slug} material={m} />
            ))}
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-2xl font-bold mb-6">📂 分类浏览</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Object.entries(categories)
              .sort(([, a], [, b]) => a.order - b.order)
              .map(([key, config]) => (
                <Link
                  key={key}
                  href={`/blog/${key}`}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-800
                    hover:translate-y-[-2px] transition-transform text-center"
                  style={{ borderRadius: "8px" }}
                >
                  <div className="text-2xl mb-2">{config.icon}</div>
                  <div className="font-medium text-sm">{key}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {config.description}
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
```

### 2.2 Hero 区域

```tsx
// components/HeroSection.tsx

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
        🔐 Security Blog
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        面向网络安全研究者的技术笔记归档<br />
        与专业能力展示独立站
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/blog"
          className="px-6 py-3 rounded-lg bg-blue-600 text-white
            hover:bg-blue-700 transition-colors font-medium"
        >
          阅读博客
        </Link>
        <Link
          href="/resume"
          className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700
            hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          查看简历
        </Link>
      </div>
    </section>
  );
}
```

### 2.3 分类筛选区（按分类统计）

```tsx
// 首页底部展示各分类文章数量

const categoryCounts: Record<string, number> = {};
getPublishedPosts().forEach((p) => {
  categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
});
// 在分类卡片中显示 {categoryCounts[key]} 篇
```

---

## 三、关于页实现

```tsx
// app/about/page.tsx

import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

export const metadata: Metadata = {
  title: "关于",
};

export default function AboutPage() {
  const filePath = path.join(process.cwd(), "content", "about.md");
  let html = "<p>关于页内容未配置</p>";

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { content } = matter(raw);
    const result = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: false })
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .processSync(content);
    html = String(result.value);
  } catch {
    // 文件不存在时使用默认内容
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">👤 关于</h1>
      <div
        className="prose prose-gray dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
```

---

## 四、Writeups 汇总页

```tsx
// app/writeups/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "CTF Writeups",
  description: "CTF竞赛题解归档",
};

export default function WriteupsPage() {
  const writeups = getPublishedPosts()
    .filter((p) => p.type === "writeup")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 按比赛分组
  const grouped: Record<string, typeof writeups> = {};
  for (const w of writeups) {
    const competition = w.competition || "其他比赛";
    if (!grouped[competition]) grouped[competition] = [];
    grouped[competition].push(w);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">🏆 CTF Writeups</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        CTF 竞赛题解归档 · 共 {writeups.length} 篇
      </p>

      {Object.entries(grouped).map(([competition, items]) => (
        <section key={competition} className="mb-10">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            {competition}
            <span className="text-sm text-gray-500 ml-2">
              ({items.length} 篇)
            </span>
          </h2>

          <div className="grid gap-4">
            {items.map((w) => (
              <Link
                key={w.slug}
                href={`/blog/${w.category}/${w.slug}`}
                className="block p-4 rounded-lg border border-gray-200 dark:border-gray-800
                  hover:border-orange-500 transition-colors"
                style={{ borderRadius: "8px" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full
                    bg-orange-100 dark:bg-orange-900/30
                    text-orange-700 dark:text-orange-400">
                    {w.category}
                  </span>
                  {w.difficulty && (
                    <span className="text-xs text-gray-500">{w.difficulty}</span>
                  )}
                </div>
                <h3 className="font-semibold">{w.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{w.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {writeups.length === 0 && (
        <p className="text-gray-500 text-center py-12">暂无 Writeup</p>
      )}
    </main>
  );
}
```

---

## 五、about.md 内容示例

```markdown
---
---

## 关于我

你好！我是一名专注于二进制安全的网络安全研究者。

### 研究方向

- **二进制漏洞利用**：堆溢出、UAF、格式化字符串等
- **Linux 内核安全**：内核漏洞分析与利用
- **CTF 竞赛**：Pwn 方向主力选手

### 关于本博客

本站是我个人学习过程中的技术笔记归档。
所有文章均为原创，如有错误欢迎指出。

### 联系方式

- GitHub: [github.com/your-name](https://github.com/your-name)
- Email: your-name@example.com
```

---

## 六、关键文件清单

| 文件路径 | 功能 |
|---------|------|
| `app/page.tsx` | 首页（Hero + 最新内容 + 分类导航） |
| `app/about/page.tsx` | 关于页（Markdown 渲染） |
| `app/writeups/page.tsx` | Writeup 汇总页（按比赛分组） |
| `components/HeroSection.tsx` | 首页 Hero 区域 |
| `content/about.md` | 关于页内容 |

# 路由规范与 SEO 实现方案

## 一、路由生成规则

### 1.1 URL 映射规则

```
content/blog/{category}/{filename}.md
         ↓
    /blog/{category}/{slug}
```

### 1.2 Slug 解析优先级

```typescript
// lib/content.ts

export function resolveSlug(filePath: string, frontmatter: Record<string, unknown>): string {
  // 优先级 1：手动指定 slug
  if (frontmatter.slug && typeof frontmatter.slug === "string") {
    return frontmatter.slug;
  }
  // 优先级 2：文件名（不含扩展名）
  const basename = path.basename(filePath, ".md");
  return basename;
}
```

### 1.3 动态路由实现

```
app/
├── blog/
│   ├── [category]/
│   │   └── [slug]/
│   │       └── page.tsx    # /blog/{category}/{slug}
│   └── page.tsx             # /blog
│
├── materials/
│   ├── [category]/
│   │   └── page.tsx         # /materials/{category}
│   └── page.tsx              # /materials
```

---

## 二、generateStaticParams

### 2.1 博客文章详情页

```typescript
// app/blog/[category]/[slug]/page.tsx

export async function generateStaticParams() {
  const posts = getPublishedPosts();
  return posts.map((post) => ({
    category: post.category,
    slug: post.slug,
  }));
}
```

### 2.2 博客分类列表页

```typescript
// app/blog/[category]/page.tsx

export async function generateStaticParams() {
  const posts = getPublishedPosts();
  const categories = Array.from(new Set(posts.map((p) => p.category)));
  return categories.map((category) => ({ category }));
}
```

### 2.3 博客列表分页（预留）

```typescript
// app/blog/page.tsx
// 当文章超过 POSTS_PER_PAGE=10 篇时自动分页

export async function generateStaticParams() {
  const posts = getPublishedPosts();
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  if (totalPages <= 1) return [];  // 单页不生成分页路由

  return Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
  }));
}
```

### 2.4 资料库分类列表页

```typescript
// app/materials/[category]/page.tsx

export async function generateStaticParams() {
  const materials = getAllMaterials();
  const categories = Array.from(new Set(materials.map((m) => m.category)));
  return categories.map((category) => ({ category }));
}
```

---

## 三、generateMetadata（动态 SEO）

### 3.1 文章详情页

```typescript
// app/blog/[category]/[slug]/page.tsx

import type { Metadata } from "next";

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
      authors: [post.author],
      tags: post.tags,
      images: post.cover
        ? [{ url: post.cover, width: 1200, height: 630 }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}
```

### 3.2 简历页

```typescript
// app/resume/page.tsx

export async function generateMetadata(): Promise<Metadata> {
  const resume = getResume();

  return {
    title: `简历 - ${resume.name}`,
    description: `${resume.name} | ${resume.title}`,
    openGraph: {
      title: `${resume.name} - ${resume.title}`,
      description: `${resume.name} 的个人简历`,
      type: "profile",
    },
  };
}
```

### 3.3 首页

```typescript
// app/page.tsx

export const metadata: Metadata = {
  title: "安全技术博客",
  description: "网络安全研究者的技术笔记、研究素材归档与专业能力展示",
  openGraph: {
    title: "安全技术博客",
    description: "网络安全研究者的技术笔记、研究素材归档与专业能力展示",
    type: "website",
  },
};
```

---

## 四、sitemap.xml 自动生成

```typescript
// app/sitemap.ts

import type { MetadataRoute } from "next";

const BASE_URL = "https://your-domain.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getPublishedPosts();

  const blogUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.category}/${post.slug}`,
    lastModified: post.updated || post.date,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = Array.from(
    new Set(posts.map((p) => p.category))
  ).map((cat) => ({
    url: `${BASE_URL}/blog/${cat}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const materials = getAllMaterials();
  const materialUrls: MetadataRoute.Sitemap = materials.map((m) => ({
    url: `${BASE_URL}/materials/${m.category}`,
    lastModified: m.date,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/materials`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/writeups`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resume`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    ...blogUrls,
    ...categoryUrls,
    ...materialUrls,
  ];
}
```

---

## 五、robots.txt 生成

```typescript
// app/robots.ts

import type { MetadataRoute } from "next";

const BASE_URL = "https://your-domain.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

---

## 六、Structured Data（Schema.org JSON-LD）

### 6.1 文章详情页 —— Article / BlogPosting Schema

```typescript
// components/ArticleSchema.tsx

import type { ParsedBlogPost } from "@/lib/content";

export function ArticleSchema({ post }: { post: ParsedBlogPost }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: post.date,
    dateModified: post.updated || post.date,
    keywords: post.tags.join(", "),
    articleSection: post.category,
    wordCount: post.wordCount,
    ...(post.cover
      ? { image: `https://your-domain.com${post.cover}` }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### 6.2 面包屑导航 —— BreadcrumbList Schema

```typescript
// components/BreadcrumbSchema.tsx

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://your-domain.com${item.url}`,
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

### 6.3 简历页 —— Person Schema

```typescript
// components/PersonSchema.tsx

import type { Resume } from "@/lib/schema";

export function PersonSchema({ resume }: { resume: Resume }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: resume.name,
    jobTitle: resume.title,
    email: resume.email,
    url: `https://your-domain.com/resume`,
    sameAs: resume.github
      ? [`https://${resume.github}`]
      : [],
    ...(resume.location
      ? { address: { "@type": "PostalAddress", addressLocality: resume.location } }
      : {}),
    knowsAbout: resume.skills.flatMap((g) => g.items),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### 6.4 面包屑数据生成

```typescript
// lib/breadcrumb.ts

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

## 七、Canonical URL

```typescript
// 每页 metadata 中添加
{
  alternates: {
    canonical: `${BASE_URL}/blog/${category}/${slug}`,
  },
}
```

---

## 八、SEO 检查清单

| 项目 | 实现方式 | 状态 |
|------|---------|------|
| `<title>` | `generateMetadata` 逐页设置 | ✅ |
| `<meta description>` | `generateMetadata` 逐页设置 | ✅ |
| Open Graph (og:title/description/image) | `generateMetadata.openGraph` | ✅ |
| Twitter Card | `generateMetadata.twitter` | ✅ |
| Canonical URL | `generateMetadata.alternates.canonical` | ✅ |
| sitemap.xml | `app/sitemap.ts` | ✅ |
| robots.txt | `app/robots.ts` | ✅ |
| JSON-LD Article/BlogPosting | `<ArticleSchema>` 组件 | ✅ |
| JSON-LD BreadcrumbList | `<BreadcrumbSchema>` 组件 | ✅ |
| JSON-LD Person | `<PersonSchema>` 组件 | ✅ |
| Semantic HTML | `<article>`, `<nav>`, `<header>`, `<main>`, `<aside>` | ✅ |
| Alt text | 文章内图片必须填写 alt | ✅ |

# 项目架构与系统设计文档

## 一、项目概述

**项目名称**：安全技术博客（Security Tech Blog）
**定位**：面向网络安全研究者的个人技术笔记归档与专业能力展示独立站
**核心原则**：完全静态化、零后端、内容即代码

---

## 二、技术选型论证

### 2.1 框架：Next.js 15 (App Router)

| 考量维度 | 选型理由 |
|---------|---------|
| SSG 原生支持 | `generateStaticParams` + `next export` 天然支持全静态生成 |
| React Server Components | 构建时执行，无运行时 JS 开销 |
| MDX/Remark 生态 | 丰富的 Markdown 处理插件链 |
| Vercel 原生部署 | 一键部署，零配置 |
| TypeScript 原生支持 | 类型安全的内容处理管线 |

### 2.2 核心依赖

```json
{
  "核心": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "typescript": "^5.0.0"
  },
  "内容处理": {
    "gray-matter": "YAML frontmatter 解析",
    "remark": "Markdown AST 处理",
    "remark-gfm": "GitHub Flavored Markdown",
    "remark-math": "数学公式支持",
    "rehype-katex": "KaTeX 渲染",
    "rehype-highlight": "代码高亮",
    "rehype-slug": "标题 id 生成（TOC 锚点）",
    "rehype-sanitize": "XSS 防护",
    "rehype-stringify": "AST → HTML"
  },
  "搜索": {
    "flexsearch": "客户端静态全文搜索"
  },
  "校验": {
    "zod": "Frontmatter schema 校验"
  },
  "UI": {
    "next-themes": "暗色/亮色主题切换"
  },
  "图片": {
    "plaiceholder": "构建时生成 blurDataURL"
  },
  "字体": {
    "@next/font": "Inter + JetBrains Mono 优化加载"
  }
}
```

---

## 三、整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                      构建时 (Build Time)                  │
│                                                          │
│  ┌──────────┐   ┌───────────┐   ┌──────────────────┐   │
│  │ content/ │──▶│  lib/     │──▶│  Next.js SSG     │   │
│  │ *.md     │   │ content.ts│   │  generateStatic  │   │
│  │          │   │ markdown.ts│  │  Params          │   │
│  │          │   │ search.ts │   │                  │   │
│  │          │   │ schema.ts │   │  ┌────────────┐  │   │
│  └──────────┘   └───────────┘   │  │ HTML/CSS   │  │   │
│                                 │  │ JS Bundle  │  │   │
│  ┌──────────┐                   │  │ search-idx │  │   │
│  │ config/  │──────────────────▶│  │ sitemap    │  │   │
│  │categories│                   │  └────────────┘  │   │
│  └──────────┘                   └──────────────────┘   │
│                                          │               │
└──────────────────────────────────────────┼───────────────┘
                                           │
                       ┌───────────────────▼───────────────────┐
                       │          运行时 (Browser)               │
                       │                                        │
                       │  ┌──────────┐  ┌───────────────────┐  │
                       │  │ 静态HTML │  │ flexsearch        │  │
                       │  │ 页面     │  │ 客户端搜索        │  │
                       │  │          │  │ (search-index.json)│  │
                       │  └──────────┘  └───────────────────┘  │
                       │                                        │
                       │  ┌──────────┐  ┌───────────────────┐  │
                       │  │ next/    │  │ next-themes       │  │
                       │  │ image    │  │ 暗色/亮色切换     │  │
                       │  └──────────┘  └───────────────────┘  │
                       └────────────────────────────────────────┘
```

---

## 四、数据流设计

```
Markdown 文件 (content/**/*.md)
        │
        ▼
  ┌─────────────┐
  │ gray-matter  │  ← 解析 frontmatter + body
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ Zod Schema   │  ← 校验 frontmatter 字段
  │ 校验         │     draft=true 过滤
  └──────┬──────┘
         │
    ┌────┴────┐
    ▼         ▼
 blog/    materials/
 posts    items
    │         │
    └────┬────┘
         │
         ▼
  ┌─────────────┐
  │ remark 管线  │  ← remark-gfm → remark-math
  │              │     → rehype-katex → rehype-highlight
  │              │     → rehype-slug → rehype-sanitize
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ HTML 输出    │  ← 渲染到页面组件
  └─────────────┘

并行管线：
  所有 posts ──▶ flexsearch 索引 ──▶ public/search-index.json
  所有路由  ──▶ generateStaticParams ──▶ 所有 .html 页面
  所有路由  ──▶ sitemap.xml 生成
```

---

## 五、页面路由树与组件映射

```
app/
├── layout.tsx                    # 根布局（字体、主题Provider、导航栏、页脚）
├── page.tsx                      # 首页 /
│   ├── HeroSection
│   ├── RecentPosts (最新5篇博客卡片)
│   └── RecentMaterials (最新5份资料卡片)
│
├── blog/
│   ├── page.tsx                  # /blog 全部博客列表（分页）
│   │   └── PostCard
│   ├── [category]/
│   │   ├── page.tsx              # /blog/[category] 分类列表
│   │   │   └── PostCard
│   │   └── [slug]/
│   │       └── page.tsx          # /blog/[category]/[slug] 文章详情
│   │           ├── BreadcrumbNav
│   │           ├── PostHeader (标题、日期、标签、难度)
│   │           ├── TableOfContents (浮动TOC)
│   │           ├── ProgressBar (阅读进度条)
│   │           ├── MarkdownBody (渲染后的正文)
│   │           └── PostFooter (系列导航)
│
├── materials/
│   ├── page.tsx                  # /materials 资料库列表
│   │   └── MaterialCard
│   └── [category]/
│       └── page.tsx              # /materials/[category] 分类资料列表
│           └── MaterialCard
│
├── writeups/
│   └── page.tsx                  # /writeups CTF Writeup 汇总
│       └── WriteupCard
│
├── resume/
│   └── page.tsx                  # /resume 简历页
│       ├── Timeline
│       ├── SkillTags
│       └── ProjectCards
│
├── about/
│   └── page.tsx                  # /about 关于页面
│
├── search/
│   └── page.tsx                  # /search 搜索页面
│       └── SearchBar + SearchResults
│
├── sitemap.ts                    # 自动生成 sitemap.xml
└── robots.ts                     # 自动生成 robots.txt
```

---

## 六、强约束清单（必须遵守）

| # | 约束 | 说明 |
|---|------|------|
| 1 | 禁止 SSR | 不使用 `getServerSideProps`、`force-dynamic`、`cookies()`、`headers()` 等动态 API |
| 2 | 禁止数据库 | 无 `prisma`、`drizzle`、`better-sqlite3` 等任何数据库依赖 |
| 3 | 禁止 API 路由 | 无 `route.ts` 文件（构建期 `scripts/` 脚本除外） |
| 4 | 禁止认证 | 无 `next-auth`、`clerk` 等任何认证库 |
| 5 | 禁止运行时文件读写 | 所有文件读取仅在 `generateStaticParams` / `page.tsx` 的顶层（构建时）进行 |
| 6 | 静态导出模式 | `next.config.mjs` 中设置 `output: 'export'` |
| 7 | 内容驱动 | 所有页面内容来源于 `content/` 目录下的 Markdown 文件 |
| 8 | 图片 < 200KB | 封面图必须压缩到 200KB 以下 |
| 9 | XSS 防护 | 所有 Markdown 渲染必须经过 `rehype-sanitize` |

---

## 七、构建流程

```
next build
  │
  ├─ 1. 扫描 content/ 目录，读取所有 .md 文件
  │     ├─ gray-matter 解析 frontmatter
  │     ├─ Zod 校验 schema（不符合的打印 warning 并跳过）
  │     └─ 按 draft/status 过滤
  │
  ├─ 2. 生成搜索索引
  │     └─ 写入 public/search-index.json
  │
  ├─ 3. 生成静态路由
  │     ├─ generateStaticParams 为所有动态路由生成参数
  │     ├─ 每个 page.tsx 在构建时执行，生成 .html
  │     └─ 分页路由预生成
  │
  ├─ 4. 图片优化
  │     ├─ next/image 处理所有 public/images/ 下图片
  │     └─ plaiceholder 生成 blurDataURL
  │
  ├─ 5. SEO 产物
  │     ├─ sitemap.xml
  │     └─ robots.txt
  │
  └─ 6. 输出到 out/ 目录
        └─ 全静态文件（HTML/CSS/JS/JSON/图片）
```

---

## 八、技术决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| CSS 方案 | Tailwind CSS | Next.js 原生集成，JIT 编译，与静态导出兼容 |
| 搜索库 | flexsearch | 体积 < 10KB gzip，支持中文+英文混合，支持预构建索引导出 |
| Markdown 解析 | gray-matter + unified 管线 | 生态最丰富，插件化架构，安全可控 |
| 代码高亮 | rehype-highlight | 静态高亮（非运行时），体积小，主题丰富 |
| 数学公式 | KaTeX | 比 MathJax 快 10x，静态渲染，无运行时 JS |
| Schema 校验 | Zod | TypeScript-first，零依赖，tree-shakable |
| 主题切换 | next-themes | 避免 hydration mismatch，SSG 兼容 |
| 图片占位 | plaiceholder | 构建时生成，纯 CSS base64，无运行时网络请求 |
| RSS | 不实现 | 用户明确排除 |
| 相关推荐 | 不实现 | 用户明确排除 |

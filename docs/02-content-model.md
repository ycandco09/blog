# 内容模型与数据架构文档

## 一、概述

本项目采用「Markdown 文件驱动」的内容管理模式，所有内容以 `.md` 文件形式存放在 `content/` 目录下，通过 Git 进行版本控制。本文档定义所有内容类型的 frontmatter 数据模型、Zod 校验 schema、以及构建时的过滤策略。

---

## 二、目录结构约定

```
content/
├── blog/                          # 博客文章
│   ├── Pwn/                       # 二进制漏洞利用
│   │   └── heap-overflow-basic.md
│   ├── Web/                       # Web安全
│   ├── Reverse/                   # 逆向工程
│   ├── Crypto/                    # 密码学
│   └── Misc/                      # 杂项
│
├── materials/                     # 资料库
│   ├── Pwn/
│   ├── Web/
│   ├── Reverse/
│   ├── Crypto/
│   └── Misc/
│
├── writeups/                      # CTF Writeup（可选子分类）
│   ├── 2024-xxxCTF/
│   └── 2025-xxxCTF/
│
└── resume.md                      # 单文件简历
```

**核心理念**：文件夹名即分类名，新增分类只需新建文件夹。

---

## 三、博客文章模型（BlogPost）

### 3.1 Frontmatter Schema

```yaml
---
title: "堆溢出利用基础"
description: "本文介绍glibc堆管理器中堆溢出的基本原理与利用方法"
author: your-name
date: 2024-03-15
updated: 2024-06-20

tags: [heap, glibc, pwn, exploitation]
category: Pwn

type: note          # note | writeup | research

slug: heap-overflow-basic

draft: false

difficulty: easy     # easy | medium | hard | expert
competition: null    # 仅 writeup 类型填写 CTF 名称

series: heap-exploitation
order: 1

cover: /images/covers/heap-overflow.png

status: published    # published | updated

# === 新增优化字段 ===
featured: false      # 是否在首页精选展示
---
```

### 3.2 Zod Schema 定义

```typescript
// lib/schema.ts

import { z } from "zod";

export const BlogPostSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().min(1, "描述不能为空").max(200, "描述最多200字"),
  author: z.string().default("your-name"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须为 YYYY-MM-DD"),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),

  tags: z.array(z.string()).default([]),
  category: z.string().min(1, "分类不能为空"),

  type: z.enum(["note", "writeup", "research"]).default("note"),

  slug: z.string().optional(),

  draft: z.boolean().default(false),

  difficulty: z.enum(["easy", "medium", "hard", "expert"]).default("medium"),
  competition: z.string().nullable().default(null),

  series: z.string().optional(),
  order: z.number().int().positive().optional(),

  cover: z.string().optional(),
  status: z.enum(["published", "updated"]).default("published"),

  featured: z.boolean().default(false),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;
```

### 3.3 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 文章标题，用于页面 `<h1>` 和 `<title>` |
| `description` | string | ✅ | SEO description，卡片摘要，限制 200 字 |
| `date` | string | ✅ | 发布日期，格式 `YYYY-MM-DD` |
| `updated` | string | ❌ | 更新日期，仅 `status: updated` 时有效 |
| `tags` | string[] | ❌ | 标签列表，用于搜索和筛选 |
| `category` | string | ✅ | 分类名，必须与文件夹名一致 |
| `type` | enum | ❌ | `note` 笔记 / `writeup` 赛题 / `research` 研究 |
| `slug` | string | ❌ | 自定义 URL slug，优先级高于文件名 |
| `draft` | boolean | ❌ | 草稿标记，生产环境跳过 |
| `difficulty` | enum | ❌ | 难度标记，用于卡片 UI |
| `competition` | string | ❌ | CTF 比赛名称，仅 writeup 类型填写 |
| `series` | string | ❌ | 系列文章标识，同系列文章自动关联 |
| `order` | number | ❌ | 系列内排序序号 |
| `cover` | string | ❌ | 封面图路径，相对于 `public/` |
| `status` | enum | ❌ | `published` 或 `updated` |
| `featured` | boolean | ❌ | 是否精选，首页可展示 |

---

## 四、资料库模型（Material）

### 4.1 Frontmatter Schema

```yaml
---
title: "Glibc 堆管理源码分析"
description: "glibc malloc/free 核心实现源码注释版"
category: Pwn
type: material

file_path: /materials/Pwn/glibc-heap-analysis.pdf
size: 2.3MB

date: 2024-02-10
tags: [glibc, heap, source-code]
---
```

### 4.2 Zod Schema

```typescript
export const MaterialSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(200),
  category: z.string().min(1),
  type: z.literal("material"),

  file_path: z.string().startsWith("/materials/"),
  size: z.string().regex(/^\d+(\.\d+)?(KB|MB|GB)$/),

  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string()).default([]),
});

export type Material = z.infer<typeof MaterialSchema>;
```

### 4.3 文件存储约定

资料实体文件存放在 `public/materials/{category}/` 下：

```
public/materials/
├── Pwn/
│   └── glibc-heap-analysis.pdf
├── Web/
│   └── xss-cheatsheet.pdf
└── ...
```

`file_path` 是相对于 `public/` 的路径，构建后直接作为静态资源 URL。

---

## 五、简历模型（Resume）

### 5.1 Frontmatter Schema

```yaml
---
name: "张三"
title: "二进制安全研究员"
email: "zhangsan@example.com"
github: "github.com/zhangsan"
blog: "zhangsan.blog"
location: "北京"
avatar: "/images/avatars/me.jpg"

skills:
  - name: "二进制安全"
    items:
      - "x86_64 汇编"
      - "ROP 链构造"
      - "Heap Exploit"
      - "Linux 内核利用"
  - name: "编程语言"
    items:
      - "Python"
      - "C/C++"
      - "JavaScript"
      - "Golang"
  - name: "工具链"
    items:
      - "GDB + pwntools"
      - "IDA Pro / Ghidra"
      - "Docker / QEMU"
      - "Git"

experience:
  - role: "安全研究员"
    company: "某安全实验室"
    period: "2023.06 - 至今"
    description: "负责二进制漏洞挖掘与利用技术研究"
  - role: "安全实习"
    company: "某科技公司"
    period: "2022.07 - 2022.12"
    description: "参与Web安全测试与渗透测试"

projects:
  - name: "heap-exploit-toolkit"
    url: "https://github.com/zhangsan/heap-exploit-toolkit"
    description: "一套堆利用自动化工具集"
    stars: 256
  - name: "CTF-Notes"
    url: "https://github.com/zhangsan/CTF-Notes"
    description: "个人CTF参赛笔记与题解归档"
    stars: 89

education:
  - school: "某大学"
    degree: "网络空间安全 硕士"
    period: "2021.09 - 2024.06"
  - school: "某大学"
    degree: "计算机科学与技术 学士"
    period: "2017.09 - 2021.06"

certifications:
  - name: "OSCP"
    issuer: "OffSec"
    year: "2023"

pdf_resume: "/materials/resume.pdf"    # 可选：PDF 下载
---
```

### 5.2 Zod Schema

```typescript
const SkillGroupSchema = z.object({
  name: z.string(),
  items: z.array(z.string()),
});

const ExperienceSchema = z.object({
  role: z.string(),
  company: z.string(),
  period: z.string(),
  description: z.string().optional(),
});

const ProjectSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
  stars: z.number().int().nonnegative().optional(),
});

const EducationSchema = z.object({
  school: z.string(),
  degree: z.string(),
  period: z.string(),
});

const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  year: z.string(),
});

export const ResumeSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  email: z.string().email().optional(),
  github: z.string().optional(),
  blog: z.string().optional(),
  location: z.string().optional(),
  avatar: z.string().optional(),

  skills: z.array(SkillGroupSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  education: z.array(EducationSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),

  pdf_resume: z.string().optional(),
});

export type Resume = z.infer<typeof ResumeSchema>;
```

---

## 六、Writeup 模型

Writeup 复用 BlogPost 模型，通过 `type: "writeup"` 区分。额外约束：

- `competition` 字段必填（CTF 比赛名称）
- `difficulty` 反映题目难度
- 文件存放在 `content/writeups/` 下，但路由仍走 `/writeups`

writeups 页面作为聚合页，按 `competition` 分组展示。

---

## 七、分类配置模型（增强版）

```typescript
// config/categories.ts

export interface CategoryConfig {
  icon: string;           // emoji 或图标标识
  description: string;    // 中文描述
  color: string;          // 主题色（用于标签、边框）
  order: number;          // 排序权重（越小越靠前）
  showInNav: boolean;     // 是否在导航栏显示
}

export const categories: Record<string, CategoryConfig> = {
  Pwn: {
    icon: "💣",
    description: "二进制漏洞利用",
    color: "#e74c3c",
    order: 1,
    showInNav: true,
  },
  Web: {
    icon: "🌐",
    description: "Web安全",
    color: "#3498db",
    order: 2,
    showInNav: true,
  },
  Reverse: {
    icon: "🔍",
    description: "逆向工程",
    color: "#2ecc71",
    order: 3,
    showInNav: true,
  },
  Crypto: {
    icon: "🔐",
    description: "密码学",
    color: "#9b59b6",
    order: 4,
    showInNav: true,
  },
  Misc: {
    icon: "📦",
    description: "杂项",
    color: "#95a5a6",
    order: 5,
    showInNav: false,
  },
};
```

**设计原则**：`categories.ts` 仅含 UI 展示信息。分类的存在性由 `content/` 目录自动扫描决定（避免双数据源）。

---

## 八、Draft 与发布策略

### 8.1 过滤规则

```typescript
// lib/content.ts - getPublishedPosts()

export function getPublishedPosts(): BlogPost[] {
  const allPosts = getAllPosts();

  return allPosts.filter((post) => {
    if (post.draft && process.env.NODE_ENV === "production") {
      console.log(`[draft] 跳过草稿: ${post.slug}`);
      return false;
    }
    return true;
  });
}
```

### 8.2 行为矩阵

| 环境 | draft: true | draft: false |
|------|------------|--------------|
| `development` | 显示（带 [Draft] 标识） | 正常显示 |
| `production` | 隐藏（构建日志记录） | 正常显示 |

### 8.3 status 字段语义

| status | 含义 | UI 表现 |
|--------|------|---------|
| `published` | 首次发布 | 显示发布日期 |
| `updated` | 有更新 | 同时显示发布日期和更新日期 |

---

## 九、内容读取管线

```typescript
// lib/content.ts 核心类型定义

export interface ContentFile {
  slug: string;           // URL slug
  category: string;       // 分类
  filePath: string;       // 源文件相对路径
  rawContent: string;     // Markdown body
  frontmatter: Record<string, unknown>; // 原始 frontmatter
}

export interface ParsedBlogPost extends BlogPost {
  slug: string;
  html: string;           // 渲染后的 HTML
  headings: Heading[];    // 用于 TOC 生成
  readingTime: number;    // 阅读时间（分钟）
  wordCount: number;      // 字数统计
}

export interface Heading {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}
```

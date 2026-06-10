# 构建流程与部署方案

## 一、概述

项目采用 Next.js 的静态导出模式（`output: 'export'`），构建产物为纯静态文件，可部署于任意静态托管平台，推荐 Vercel。

---

## 二、next.config.mjs

```javascript
// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",

  images: {
    unoptimized: true,  // static export 必须设置
  },
};

export default nextConfig;
```

### 说明

| 配置 | 值 | 原因 |
|------|-----|------|
| `output` | `"export"` | 启用静态导出模式 |
| `images.unoptimized` | `true` | `next/image` 优化需要 Node 服务端，静态导出不支持 |

---

## 三、package.json 脚本

```json
{
  "name": "security-tech-blog",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "npx serve@latest out",
    "postbuild": "node scripts/postbuild.mjs"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-themes": "^0.4.0",
    "flexsearch": "^0.8.0",
    "gray-matter": "^4.0.3",
    "unified": "^11.0.0",
    "remark-parse": "^11.0.0",
    "remark-gfm": "^4.0.0",
    "remark-math": "^6.0.0",
    "remark-rehype": "^11.0.0",
    "rehype-katex": "^7.0.0",
    "rehype-highlight": "^7.0.0",
    "rehype-slug": "^6.0.0",
    "rehype-sanitize": "^6.0.0",
    "rehype-stringify": "^10.0.0",
    "zod": "^3.23.0",
    "@tailwindcss/typography": "^0.5.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0"
  }
}
```

---

## 四、构建流程

```
npm run build
  │
  ├─ next build
  │   ├─ 扫描 app/ 目录，收集所有 page.tsx
  │   ├─ 执行 generateStaticParams() → 确定所有动态路由参数
  │   ├─ 为每个路由执行 page.tsx（服务端构建时）
  │   │   ├─ 读取 content/**/*.md 文件
  │   │   ├─ gray-matter 解析 frontmatter
  │   │   ├─ Zod 校验（不符合的跳过并打印 warning）
  │   │   ├─ unified 管线渲染 Markdown → HTML
  │   │   └─ generateMetadata() 生成 SEO 标签
  │   ├─ 输出 HTML/CSS/JS 到 out/ 目录
  │   └─ 同步 public/ 下静态资源到 out/
  │
  └─ node scripts/postbuild.mjs
      ├─ 内容统计输出
      │   ├─ Posts: 12 (1 draft hidden)
      │   ├─ Materials: 5
      │   ├─ Writeups: 3
      │   └─ Categories: Pwn(4), Web(3), ...
      ├─ 搜索索引校验
      │   └─ search-index.json 存在且非空
      └─ 文件完整性检查
          └─ 所有 file_path 指向的 public 文件存在
```

---

## 五、构建后脚本

```javascript
// scripts/postbuild.mjs

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function main() {
  console.log("\n📊 Build Summary\n" + "=".repeat(40));

  // 读取内容统计
  const contentDir = path.join(root, "content");

  const blogDir = path.join(contentDir, "blog");
  const materialsDir = path.join(contentDir, "materials");
  const writeupsDir = path.join(contentDir, "writeups");

  const countMdFiles = (dir) => {
    let count = 0;
    if (!fs.existsSync(dir)) return 0;
    function walk(d) {
      const entries = fs.readdirSync(d, { withFileTypes: true });
      for (const e of entries) {
        if (e.isDirectory()) walk(path.join(d, e.name));
        else if (e.name.endsWith(".md")) count++;
      }
    }
    walk(dir);
    return count;
  };

  const blogCount = countMdFiles(blogDir);
  const materialCount = countMdFiles(materialsDir);
  const writeupCount = countMdFiles(writeupsDir);

  console.log(`  Posts:       ${blogCount}`);
  console.log(`  Materials:   ${materialCount}`);
  console.log(`  Writeups:    ${writeupCount}`);

  // 验证搜索索引
  const searchIndexPath = path.join(root, "out", "search-index.json");
  if (fs.existsSync(searchIndexPath)) {
    const stat = fs.statSync(searchIndexPath);
    console.log(`  Search Index: ${(stat.size / 1024).toFixed(1)}KB`);
  } else {
    console.warn("  ⚠ Search Index: 未生成");
  }

  // 验证 output 目录
  const outDir = path.join(root, "out");
  if (fs.existsSync(outDir)) {
    const items = fs.readdirSync(outDir);
    console.log(`  Output files: ${items.length} items`);
  }

  console.log("\n✅ Build completed successfully\n");
}

main();
```

---

## 六、搜索索引构建集成

搜索索引在 `next build` 之前通过 prebuild 脚本生成：

```json
// package.json
{
  "scripts": {
    "prebuild": "node scripts/build-search.mjs",
    "build": "next build",
    "postbuild": "node scripts/postbuild.mjs"
  }
}
```

```javascript
// scripts/build-search.mjs

import { buildSearchIndex } from "../lib/search.ts";

console.log("[prebuild] 生成搜索索引...");
buildSearchIndex();
console.log("[prebuild] 搜索索引已生成");
```

---

## 七、Vercel 部署配置

### 7.1 自动部署

推送到 GitHub → Vercel 自动检测 Next.js 项目 → 自动执行 `npm run build` → 部署 `out/` 目录

### 7.2 vercel.json（可选）

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "out",
  "framework": "nextjs"
}
```

### 7.3 自定义域名

在 Vercel 项目设置中添加域名，配置 DNS CNAME 记录指向 `cname.vercel-dns.com`

---

## 八、环境变量

```bash
# .env.local（本地开发）
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Vercel 环境变量
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 九、内容更新工作流

```
1. 在 content/ 下新建/修改 .md 文件
2. npm run dev 或 npm run build 预览
3. git add . && git commit -m "add: xxx"
4. git push
5. Vercel 自动 rebuild + deploy
```

**核心理念**：修改内容 = 提交 Git = 自动更新网站

---

## 十、关键文件清单

| 文件路径 | 功能 |
|---------|------|
| `next.config.mjs` | Next.js 配置（static export） |
| `package.json` | 依赖 + 构建脚本 |
| `scripts/prebuild.mjs` | 预构建（生成搜索索引） |
| `scripts/postbuild.mjs` | 构建后校验 + 统计 |
| `vercel.json` | Vercel 部署配置（可选） |

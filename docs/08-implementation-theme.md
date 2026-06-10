# 主题/UI 系统实现方案 + 代码解析

## 一、模块概览

主题系统负责暗色/亮色切换、CSS 变量管理、字体加载和全局 UI 规范实施。

| 功能 | 实现方案 |
|------|---------|
| 暗色/亮色切换 | `next-themes` + CSS 变量 |
| 默认主题 | 暗色（#0a0c10） |
| 持久化 | localStorage |
| 字体 | Inter（正文）+ JetBrains Mono（代码） |
| 卡片 | 圆角 8px + hover translateY(-2px) |
| 响应式 | Tailwind 断点系统 |

---

## 二、主题配置

### 2.1 Tailwind 配置

```typescript
// tailwind.config.ts

import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0a0c10",
          card: "#13161a",
          border: "#1f2937",
        },
        light: {
          bg: "#ffffff",
          card: "#f9fafb",
          border: "#e5e7eb",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "8px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            pre: {
              fontFamily: "JetBrains Mono, monospace",
            },
            code: {
              fontFamily: "JetBrains Mono, monospace",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
```

### 2.2 CSS 变量方案

```css
/* app/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-bg: #ffffff;
    --color-bg-card: #f9fafb;
    --color-text: #111827;
    --color-text-secondary: #6b7280;
    --color-border: #e5e7eb;
    --color-accent: #2563eb;
    --color-code-bg: #f3f4f6;
    --scrollbar-thumb: #d1d5db;
  }

  .dark {
    --color-bg: #0a0c10;
    --color-bg-card: #13161a;
    --color-text: #f9fafb;
    --color-text-secondary: #9ca3af;
    --color-border: #1f2937;
    --color-accent: #3b82f6;
    --color-code-bg: #111827;
    --scrollbar-thumb: #374151;
  }

  body {
    background-color: var(--color-bg);
    color: var(--color-text);
    transition: background-color 0.2s ease, color 0.2s ease;
  }
}
```

---

## 三、根布局实现

```tsx
// app/layout.tsx

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "安全技术博客",
    template: "%s | 安全技术博客",
  },
  description: "网络安全研究者的技术笔记、研究素材归档与专业能力展示",
  metadataBase: new URL("https://your-domain.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## 四、ThemeProvider

```tsx
// components/ThemeProvider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children, ...props }: {
  children: ReactNode;
  attribute: string;
  defaultTheme: string;
  enableSystem: boolean;
  disableTransitionOnChange: boolean;
}) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

---

## 五、主题切换按钮

```tsx
// components/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md border border-gray-200 dark:border-gray-800
        hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="切换主题"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
```

---

## 六、导航栏

```tsx
// components/Navbar.tsx

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { SearchButton } from "./SearchButton";
import { MobileMenu } from "./MobileMenu";

const navLinks = [
  { href: "/blog", label: "博客" },
  { href: "/materials", label: "资料库" },
  { href: "/writeups", label: "Writeups" },
  { href: "/resume", label: "简历" },
  { href: "/about", label: "关于" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800
      bg-white/80 dark:bg-[#0a0c10]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-16">
        <Link href="/" className="text-xl font-bold tracking-tight">
          🔐 Security Blog
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="主导航">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 dark:text-gray-400
                hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SearchButton />
          <ThemeToggle />
          <MobileMenu links={navLinks} />
        </div>
      </div>
    </header>
  );
}
```

---

## 七、页脚

```tsx
// components/Footer.tsx

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Built with Next.js · Powered by Markdown · Deployed on Vercel
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} Security Blog. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
```

---

## 八、响应式设计断点

| 断点 | 宽度 | 用途 |
|------|------|------|
| `sm` | 640px | 移动端横屏 |
| `md` | 768px | 平板竖屏，导航全显 |
| `lg` | 1024px | 桌面端，TOC 侧栏显示 |
| `xl` | 1280px | 大屏内容区最大宽度 |

**核心规则**：
- 内容区 `max-w-4xl`（896px）或 `max-w-5xl`（1024px）
- 移动端隐藏侧栏元素（TOC、搜索快捷键提示）
- 文章详情 `flex-col lg:flex-row` 切换单/双栏布局

---

## 九、代码解析

### 9.1 主题切换流程

```
1. next-themes 在 <html> 上注入 class="dark" 或 class="light"
2. Tailwind darkMode: "class" 根据 .dark 类激活暗色变体
3. CSS 变量在 :root 和 .dark 下各有不同值
4. 用户切换时 setTheme() → DOM 更新 → CSS 变量切换
5. localStorage 持久化选择，避免 FOUC
```

### 9.2 avoid hydration mismatch

```
useTheme() → mounted → false → 渲染占位元素（避免 SSR/CSR mismatch）
              → true  → 渲染实际图标
```

---

## 十、关键文件清单

| 文件路径 | 功能 |
|---------|------|
| `app/layout.tsx` | 根布局（字体、主题Provider、导航、页脚） |
| `app/globals.css` | CSS 变量、Tailwind、暗色/亮色主题 |
| `tailwind.config.ts` | Tailwind 配置（暗色模式、字体、颜色） |
| `components/ThemeProvider.tsx` | next-themes Provider 封装 |
| `components/ThemeToggle.tsx` | 暗色/亮色切换按钮 |
| `components/Navbar.tsx` | 导航栏 |
| `components/Footer.tsx` | 页脚 |
| `components/SearchButton.tsx` | 搜索快捷入口 |
| `components/MobileMenu.tsx` | 移动端汉堡菜单 |

# 资料库模块实现方案 + 代码解析

## 一、模块概览

资料库模块用于归档安全研究相关参考资料（PDF、源码注释、工具文档等），包含 2 个页面：

| 页面 | 路由 | 功能 |
|------|------|------|
| 资料库总览 | `/materials` | 全部资料按分类聚合展示 |
| 分类资料列表 | `/materials/[category]` | 某分类下的资料列表 |

---

## 二、资料库总览页（/materials）

### 2.1 页面组件

```tsx
// app/materials/page.tsx

import { getAllMaterials } from "@/lib/content";
import { MaterialCard } from "@/components/MaterialCard";
import { categories } from "@/config/categories";

export default function MaterialsPage() {
  const materials = getAllMaterials()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 按分类分组
  const grouped: Record<string, Material[]> = {};
  for (const m of materials) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">📚 资料库</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        安全研究参考资料与技术文档归档
      </p>

      {Object.entries(grouped).map(([cat, items]) => {
        const config = categories[cat];
        return (
          <section key={cat} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              {config && (
                <h2
                  className="text-xl font-semibold"
                  style={{ color: config.color }}
                >
                  {config.icon} {config.description}
                </h2>
              )}
              <span className="text-sm text-gray-500">
                {items.length} 份资料
              </span>
            </div>

            <div className="grid gap-4">
              {items.map((material) => (
                <MaterialCard key={material.slug} material={material} />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
```

### 2.2 MaterialCard 组件

```tsx
// components/MaterialCard.tsx

import Link from "next/link";
import type { Material } from "@/lib/schema";
import { categories } from "@/config/categories";
import { formatDate } from "@/lib/utils";

export function MaterialCard({ material }: { material: Material & { slug: string } }) {
  const config = categories[material.category];

  const fileIcon = material.file_path.endsWith(".pdf")
    ? "📄"
    : "📁";

  return (
    <a
      href={material.file_path}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-lg border border-gray-200 dark:border-gray-800
        hover:translate-y-[-2px] transition-transform duration-200
        bg-white dark:bg-[#0a0c10]"
      style={{ borderRadius: "8px" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {config && (
              <span
                className="px-2 py-0.5 text-xs rounded-full"
                style={{
                  backgroundColor: `${config.color}20`,
                  color: config.color,
                }}
              >
                {config.icon} {config.description}
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-1">{material.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {material.description}
          </p>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span className="text-2xl">{fileIcon}</span>
          <span className="text-xs text-gray-400">{material.size}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
        <time dateTime={material.date}>{formatDate(material.date)}</time>
        {material.tags.length > 0 && (
          <span>{material.tags.map((t) => `#${t}`).join(" ")}</span>
        )}
      </div>
    </a>
  );
}
```

---

## 三、分类资料列表页（/materials/[category]）

```tsx
// app/materials/[category]/page.tsx

import { notFound } from "next/navigation";
import { getAllMaterials } from "@/lib/content";
import { MaterialCard } from "@/components/MaterialCard";
import { categories } from "@/config/categories";

export async function generateStaticParams() {
  const materials = getAllMaterials();
  return Array.from(new Set(materials.map((m) => m.category))).map((category) => ({
    category,
  }));
}

export default function CategoryMaterialsPage({
  params,
}: {
  params: { category: string };
}) {
  const config = categories[params.category];
  if (!config) notFound();

  const materials = getAllMaterials()
    .filter((m) => m.category === params.category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (materials.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">
          {config.icon} {config.description}
        </h1>
        <p className="text-gray-500">该分类下暂无资料</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">
        {config.icon} {config.description}
      </h1>
      <p className="text-gray-500 mb-8">
        {materials.length} 份资料
      </p>

      <div className="grid gap-4">
        {materials.map((material) => (
          <MaterialCard key={material.slug} material={material} />
        ))}
      </div>
    </main>
  );
}
```

---

## 四、代码解析

### 4.1 getAllMaterials 函数

```typescript
// lib/content.ts

export function getAllMaterials(): (Material & { slug: string })[] {
  const materialsDir = path.join(process.cwd(), "content", "materials");
  const results: (Material & { slug: string })[] = [];

  // 递归扫描 content/materials/ 下所有 .md 文件
  function walk(dir: string, baseCategory: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, entry.name);
      } else if (entry.name.endsWith(".md")) {
        const fileContent = fs.readFileSync(fullPath, "utf-8");
        const { data } = matter(fileContent);

        const parsed = MaterialSchema.safeParse(data);

        if (!parsed.success) {
          console.warn(`[schema] 资料校验失败: ${fullPath}`);
          console.warn(parsed.error.format());
          continue;
        }

        const slug = path.basename(entry.name, ".md");
        results.push({ ...parsed.data, slug });
      }
    }
  }

  walk(materialsDir, "");

  return results;
}
```

### 4.2 文件路径验证

```typescript
// 构建时校验：确保 file_path 指向的文件实际存在
function validateMaterialFiles(materials: Material[]): void {
  for (const m of materials) {
    const publicPath = path.join(process.cwd(), "public", m.file_path.replace(/^\//, ""));
    if (!fs.existsSync(publicPath)) {
      console.warn(`[material] 文件不存在: ${m.file_path} (来自 ${m.title})`);
    }
  }
}
```

---

## 五、关键文件清单

| 文件路径 | 功能 |
|---------|------|
| `app/materials/page.tsx` | 资料库总览页 |
| `app/materials/[category]/page.tsx` | 分类资料列表页 |
| `components/MaterialCard.tsx` | 资料卡片组件 |
| `lib/content.ts` | getAllMaterials 函数 |
| `lib/schema.ts` | MaterialSchema Zod 定义 |

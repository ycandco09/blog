import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMaterial, getAllMaterials } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { categories } from "@/config/categories";
import { formatDate } from "@/lib/utils";
import { MarkdownBody } from "@/components/MarkdownBody";
import fs from "fs";
import matter from "gray-matter";
import path from "path";

export const dynamicParams = false;

export async function generateStaticParams() {
  const materials = getAllMaterials();
  return materials.map((m) => ({
    category: m.category,
    slug: m.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const material = getMaterial(category, slug);
  if (!material) return { title: "资料不存在" };

  return {
    title: material.title,
    description: material.description,
  };
}

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const material = getMaterial(category, slug);

  if (!material) notFound();

  const config = categories[material.category];
  const raw = fs.readFileSync(material.filePath, "utf-8");
  const { content } = matter(raw);
  const html = await renderMarkdown(content);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      {/* 头部信息 */}
      <header className="mb-8">
        {config && (
          <span
            className="inline-block px-3 py-1 text-sm rounded-full text-white mb-4"
            style={{ backgroundColor: config.color }}
          >
            {config.icon} {config.description}
          </span>
        )}

        <h1 className="text-3xl font-bold mb-2">{material.title}</h1>
        <p className="text-[var(--color-text-secondary)] mb-4">
          {material.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]">
          <time dateTime={material.date}>{formatDate(material.date)}</time>
          <span>{material.size}</span>
          <span>{material.tags.map((t) => `#${t}`).join(" ")}</span>
        </div>
      </header>

      {/* 下载按钮 */}
      <a
        href={material.file_path}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 mb-8 rounded-lg
          bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
      >
        📥 下载文件 ({material.size})
      </a>

      {/* 分隔线 */}
      <hr className="border-[var(--color-border)] mb-8" />

      {/* Markdown 正文 */}
      <MarkdownBody html={html} />
    </main>
  );
}

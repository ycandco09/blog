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
  let html = "<p>关于页内容未配置，请在 content/about.md 中编写内容。</p>";

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
        className="prose prose-gray dark:prose-invert max-w-none
          prose-a:text-blue-600 dark:prose-a:text-blue-400
          prose-pre:rounded-lg"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogPostSchema, MaterialSchema, ResumeSchema } from "./schema";
import { renderMarkdown, extractHeadings } from "./markdown";
import type { BlogPost, Material, Resume } from "./schema";
import type { Heading } from "./markdown";

function getMdFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(".md")) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

export interface RawBlogPost extends BlogPost {
  slug: string;
  filePath: string;
}

export interface ParsedBlogPost extends BlogPost {
  slug: string;
  html: string;
  headings: Heading[];
  readingTime: number;
  wordCount: number;
}

export function resolveSlug(
  filePath: string,
  frontmatter: { slug?: string }
): string {
  if (frontmatter.slug) return frontmatter.slug;
  return path.basename(filePath, ".md");
}

function normalizeDates(obj: Record<string, unknown>): Record<string, unknown> {
  const result = { ...obj };
  for (const key of ["date", "updated"]) {
    if (result[key] instanceof Date) {
      result[key] = (result[key] as Date).toISOString().slice(0, 10);
    }
  }
  return result;
}

export function getAllPosts(): RawBlogPost[] {
  const blogDir = path.join(process.cwd(), "content", "blog");
  const files = getMdFiles(blogDir);
  const results: RawBlogPost[] = [];

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);

    const normalized = normalizeDates(data as Record<string, unknown>);
    const parsed = BlogPostSchema.safeParse(normalized);
    if (!parsed.success) {
      console.warn(`[schema] 文章校验失败: ${filePath}`);
      console.warn(parsed.error.format());
      continue;
    }

    const slug = resolveSlug(filePath, parsed.data);
    const category = path.basename(path.dirname(filePath));

    results.push({ ...parsed.data, slug, category, filePath });
  }

  return results;
}

export function getPublishedPosts(): RawBlogPost[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => {
    if (post.draft && process.env.NODE_ENV === "production") {
      console.log(`[draft] 跳过: ${post.slug}`);
      return false;
    }
    return true;
  });
}

export async function getPost(
  category: string,
  slug: string
): Promise<ParsedBlogPost | null> {
  const posts = getPublishedPosts();
  const post = posts.find((p) => p.category === category && p.slug === slug);
  if (!post) return null;

  const raw = fs.readFileSync(post.filePath, "utf-8");
  const { content } = matter(raw);
  const html = await renderMarkdown(content);
  const headings = extractHeadings(html);

  const wordCount = content.replace(/\s/g, "").length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 300));

  return { ...post, html, headings, readingTime, wordCount };
}

export function getAllMaterials(): (Material & { slug: string })[] {
  const materialsDir = path.join(process.cwd(), "content", "materials");
  const files = getMdFiles(materialsDir);
  const results: (Material & { slug: string })[] = [];

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);

    const normalized = normalizeDates(data as Record<string, unknown>);
    const parsed = MaterialSchema.safeParse(normalized);
    if (!parsed.success) {
      console.warn(`[schema] 资料校验失败: ${filePath}`);
      continue;
    }

    results.push({
      ...parsed.data,
      slug: path.basename(filePath, ".md"),
    });
  }

  return results;
}

export function getResume(): Resume {
  const filePath = path.join(process.cwd(), "content", "resume.md");

  if (!fs.existsSync(filePath)) {
    console.warn("[resume] resume.md 不存在，返回默认值");
    return ResumeSchema.parse({ name: "待填写", title: "" });
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);

  const parsed = ResumeSchema.safeParse(data);
  if (!parsed.success) {
    console.warn("[resume] 简历数据校验失败");
    console.warn(parsed.error.format());
    return ResumeSchema.parse({ name: "待填写", title: "" });
  }

  return parsed.data;
}

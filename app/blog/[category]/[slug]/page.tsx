import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPost, getPublishedPosts } from "@/lib/content";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { ArticleSchema } from "@/components/ArticleSchema";
import { PostHeader } from "@/components/PostHeader";
import { TableOfContents } from "@/components/TableOfContents";
import { ReadingProgress } from "@/components/ReadingProgress";
import { MarkdownBody } from "@/components/MarkdownBody";
import { SeriesNav } from "@/components/SeriesNav";
import { getPostBreadcrumbs } from "@/lib/breadcrumb";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getPublishedPosts().map((post) => ({
    category: post.category,
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const post = await getPost(category, slug);
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
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const post = await getPost(category, slug);

  if (!post) notFound();

  const breadcrumbs = getPostBreadcrumbs(post.category, post.title);

  return (
    <>
      <ArticleSchema post={post} />
      <BreadcrumbSchema items={breadcrumbs} />

      <ReadingProgress />

      <article className="max-w-4xl mx-auto px-4 py-8">
        <BreadcrumbNav items={breadcrumbs} />
        <PostHeader post={post} />

        <div className="flex gap-8 mt-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <TableOfContents headings={post.headings} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <MarkdownBody html={post.html} />
          </div>
        </div>

        {post.series && <SeriesNav post={post} />}
      </article>
    </>
  );
}

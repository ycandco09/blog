import Link from "next/link";
import type { ParsedBlogPost } from "@/lib/content";
import { getPublishedPosts } from "@/lib/content";

export function SeriesNav({ post }: { post: ParsedBlogPost }) {
  const seriesPosts = getPublishedPosts()
    .filter((p) => p.series === post.series)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (seriesPosts.length <= 1) return null;

  const currentIndex = seriesPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < seriesPosts.length - 1
      ? seriesPosts[currentIndex + 1]
      : null;

  return (
    <nav
      className="mt-12 pt-8 border-t border-[var(--color-border)]"
      aria-label={`${post.series} 系列导航`}
    >
      <h3 className="text-lg font-semibold mb-4">
        📚 系列文章：{post.series} ({currentIndex + 1}/{seriesPosts.length})
      </h3>

      <div className="flex justify-between gap-4">
        {prevPost ? (
          <Link
            href={`/blog/${prevPost.category}/${prevPost.slug}`}
            className="flex-1 p-4 rounded-lg border border-[var(--color-border)] hover:border-blue-500 transition-colors"
            style={{ borderRadius: "8px" }}
          >
            <span className="text-sm text-[var(--color-text-secondary)]">
              ← 上一篇
            </span>
            <p className="font-medium mt-1">{prevPost.title}</p>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextPost ? (
          <Link
            href={`/blog/${nextPost.category}/${nextPost.slug}`}
            className="flex-1 p-4 rounded-lg border border-[var(--color-border)] hover:border-blue-500 transition-colors text-right"
            style={{ borderRadius: "8px" }}
          >
            <span className="text-sm text-[var(--color-text-secondary)]">
              下一篇 →
            </span>
            <p className="font-medium mt-1">{nextPost.title}</p>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </nav>
  );
}

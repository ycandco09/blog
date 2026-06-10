import Link from "next/link";
import type { RawBlogPost } from "@/lib/content";
import { categories } from "@/config/categories";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: RawBlogPost;
}

export function PostCard({ post }: PostCardProps) {
  const categoryConfig = categories[post.category] || {
    icon: "📄",
    color: "#666",
    description: post.category,
  };

  return (
    <Link
      href={`/blog/${post.category}/${post.slug}`}
      className="block p-6 border border-[var(--color-border)]
        hover:translate-y-[-2px] transition-transform duration-200
        bg-[var(--color-bg-card)]"
      style={{ borderRadius: "8px" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: categoryConfig.color }}
        >
          {categoryConfig.icon} {post.category}
        </span>
        {post.difficulty && (
          <span className="text-xs text-[var(--color-text-secondary)]">
            {post.difficulty}
          </span>
        )}
        {post.type === "writeup" && (
          <span className="text-xs text-orange-500">Writeup</span>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-1 truncate">{post.title}</h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-2 line-clamp-2">
        {post.description}
      </p>

      <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <div className="flex gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="hover:text-blue-500 transition-colors">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

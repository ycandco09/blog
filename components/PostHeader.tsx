import type { ParsedBlogPost } from "@/lib/content";
import { categories } from "@/config/categories";
import { formatDate } from "@/lib/utils";

const difficultyLabels: Record<string, string> = {
  easy: "入门",
  medium: "中级",
  hard: "困难",
  expert: "专家",
};

export function PostHeader({ post }: { post: ParsedBlogPost }) {
  const catConfig = categories[post.category];

  return (
    <header className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-[var(--color-text-secondary)]">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {post.updated && (
          <time dateTime={post.updated}>
            更新于 {formatDate(post.updated)}
          </time>
        )}
        <span>·</span>
        <span>{post.readingTime} 分钟阅读</span>
        <span>·</span>
        <span>{post.wordCount} 字</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {catConfig && (
          <span
            className="px-3 py-1 rounded-full text-sm text-white"
            style={{ backgroundColor: catConfig.color }}
          >
            {catConfig.icon} {catConfig.description}
          </span>
        )}
        {post.difficulty && (
          <span className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800">
            {difficultyLabels[post.difficulty] || post.difficulty}
          </span>
        )}
        {post.type === "writeup" && post.competition && (
          <span className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            🏆 {post.competition}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs rounded-md bg-gray-100 dark:bg-gray-800
              text-[var(--color-text-secondary)]"
          >
            #{tag}
          </span>
        ))}
      </div>
    </header>
  );
}

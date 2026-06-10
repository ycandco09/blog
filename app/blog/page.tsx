import { getPublishedPosts } from "@/lib/content";
import { PostCard } from "@/components/PostCard";

export default function BlogPage() {
  const posts = getPublishedPosts().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">博客</h1>

      {posts.length === 0 ? (
        <p className="text-[var(--color-text-secondary)] text-center py-8">
          暂无文章
        </p>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}

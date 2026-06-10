import { notFound } from "next/navigation";
import { getPublishedPosts } from "@/lib/content";
import { categories } from "@/config/categories";
import { PostCard } from "@/components/PostCard";

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = getPublishedPosts();
  return Array.from(new Set(posts.map((p) => p.category))).map((category) => ({
    category,
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryConfig = categories[category];

  if (!categoryConfig) {
    notFound();
  }

  const posts = getPublishedPosts()
    .filter((p) => p.category === category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">
        {categoryConfig.icon} {category}
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-8">
        {categoryConfig.description} · {posts.length} 篇文章
      </p>

      {posts.length === 0 ? (
        <p className="text-[var(--color-text-secondary)] text-center py-8">
          该分类下暂无文章
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

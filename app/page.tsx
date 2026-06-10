import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedPosts, getAllMaterials } from "@/lib/content";
import { categories } from "@/config/categories";
import { PostCard } from "@/components/PostCard";
import { MaterialCard } from "@/components/MaterialCard";
import { HeroSection } from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "安全技术博客",
  description: "网络安全研究者的技术笔记、研究素材归档与专业能力展示",
};

export default function HomePage() {
  const posts = getPublishedPosts()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const featuredPosts = posts.filter((p) => p.featured);

  const materials = getAllMaterials()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <main>
      <HeroSection />

      <div className="max-w-5xl mx-auto px-4">
        {featuredPosts.length > 0 && (
          <section className="py-12">
            <h2 className="text-2xl font-bold mb-6">⭐ 精选文章</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        <section className="py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">📝 最新博客</h2>
            <Link
              href="/blog"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          {posts.length === 0 && (
            <p className="text-[var(--color-text-secondary)] text-center py-8">
              暂无文章
            </p>
          )}
        </section>

        <section className="py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">📚 最新资料</h2>
            <Link
              href="/materials"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-4">
            {materials.map((m) => (
              <MaterialCard key={m.slug} material={m} />
            ))}
          </div>
          {materials.length === 0 && (
            <p className="text-[var(--color-text-secondary)] text-center py-8">
              暂无资料
            </p>
          )}
        </section>

        <section className="py-12">
          <h2 className="text-2xl font-bold mb-6">📂 分类浏览</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Object.entries(categories)
              .sort(([, a], [, b]) => a.order - b.order)
              .map(([key, config]) => (
                <Link
                  key={key}
                  href={`/blog/${key}`}
                  className="p-4 border border-[var(--color-border)]
                    hover:translate-y-[-2px] transition-transform text-center
                    bg-[var(--color-bg-card)]"
                  style={{ borderRadius: "8px" }}
                >
                  <div className="text-2xl mb-2">{config.icon}</div>
                  <div className="font-medium text-sm">{key}</div>
                  <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {config.description}
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

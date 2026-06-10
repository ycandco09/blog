import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "CTF Writeups",
  description: "CTF竞赛题解归档",
};

export default function WriteupsPage() {
  const writeups = getPublishedPosts()
    .filter((p) => p.type === "writeup")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const grouped: Record<string, typeof writeups> = {};
  for (const w of writeups) {
    const competition = w.competition || "其他比赛";
    if (!grouped[competition]) grouped[competition] = [];
    grouped[competition].push(w);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">🏆 CTF Writeups</h1>
      <p className="text-[var(--color-text-secondary)] mb-8">
        CTF 竞赛题解归档 · 共 {writeups.length} 篇
      </p>

      {writeups.length === 0 ? (
        <p className="text-[var(--color-text-secondary)] text-center py-12">
          暂无 Writeup
        </p>
      ) : (
        Object.entries(grouped).map(([competition, items]) => (
          <section key={competition} className="mb-10">
            <h2 className="text-xl font-semibold mb-4 border-b border-[var(--color-border)] pb-2">
              {competition}
              <span className="text-sm text-[var(--color-text-secondary)] ml-2">
                ({items.length} 篇)
              </span>
            </h2>

            <div className="grid gap-4">
              {items.map((w) => (
                <Link
                  key={w.slug}
                  href={`/blog/${w.category}/${w.slug}`}
                  className="block p-4 border border-[var(--color-border)]
                    hover:border-orange-500 transition-colors"
                  style={{ borderRadius: "8px" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full
                      bg-orange-100 dark:bg-orange-900/30
                      text-orange-700 dark:text-orange-400">
                      {w.category}
                    </span>
                    {w.difficulty && (
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {w.difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold">{w.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    {w.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}

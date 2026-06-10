import Link from "next/link";

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
        🔐 Security Blog
      </h1>
      <p className="text-xl text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
        面向网络安全研究者的技术笔记归档
        <br />
        与专业能力展示独立站
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/blog"
          className="px-6 py-3 rounded-lg bg-blue-600 text-white
            hover:bg-blue-700 transition-colors font-medium"
        >
          阅读博客
        </Link>
        <Link
          href="/resume"
          className="px-6 py-3 rounded-lg border border-[var(--color-border)]
            hover:bg-[var(--color-bg-card)] transition-colors font-medium"
        >
          查看简历
        </Link>
      </div>
    </section>
  );
}

import type { ParsedBlogPost } from "@/lib/content";

export function ArticleSchema({ post }: { post: ParsedBlogPost }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: post.date,
    dateModified: post.updated || post.date,
    keywords: post.tags.join(", "),
    articleSection: post.category,
    wordCount: post.wordCount,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

import type { Resume } from "@/lib/schema";

export function PersonSchema({ resume }: { resume: Resume }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: resume.name,
    jobTitle: resume.title,
    email: resume.email,
    url: "https://your-domain.com/resume",
    sameAs: [
      resume.github ? `https://${resume.github}` : null,
      resume.blog ? `https://${resume.blog}` : null,
    ].filter(Boolean),
    knowsAbout: resume.skills.flatMap((g) => g.items),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

import type { Resume } from "@/lib/schema";

export function EducationTimeline({
  education,
  certifications,
}: {
  education: Resume["education"];
  certifications: Resume["certifications"];
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">🎓 教育 & 证书</h2>
      <div className="relative border-l-2 border-[var(--color-border)] pl-6 space-y-6">
        {education.map((edu, i) => (
          <div key={i} className="relative">
            <div
              className="absolute -left-[31px] w-4 h-4 rounded-full
              bg-green-600 border-2 border-[var(--color-bg)]"
            />
            <h3 className="text-lg font-semibold">{edu.school}</h3>
            <p className="text-[var(--color-text-secondary)]">{edu.degree}</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {edu.period}
            </p>
          </div>
        ))}
      </div>

      {certifications.length > 0 && (
        <div className="mt-6 space-y-2">
          {certifications.map((cert, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 border border-[var(--color-border)] rounded-lg"
            >
              <span className="font-medium">{cert.name}</span>
              <span className="text-sm text-[var(--color-text-secondary)]">
                by {cert.issuer}
              </span>
              <span className="text-sm text-[var(--color-text-secondary)] ml-auto">
                {cert.year}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

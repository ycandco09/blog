import type { Resume } from "@/lib/schema";

export function ExperienceTimeline({
  experiences,
}: {
  experiences: Resume["experience"];
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">💼 工作经历</h2>
      <div className="relative border-l-2 border-[var(--color-border)] pl-6 space-y-8">
        {experiences.map((exp, i) => (
          <div key={i} className="relative">
            <div
              className="absolute -left-[31px] w-4 h-4 rounded-full
              bg-blue-600 border-2 border-[var(--color-bg)]"
            />

            <h3 className="text-lg font-semibold">{exp.role}</h3>
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              {exp.company}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {exp.period}
            </p>
            {exp.description && (
              <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                {exp.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

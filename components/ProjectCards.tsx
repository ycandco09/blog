import type { Resume } from "@/lib/schema";

export function ProjectCards({
  projects,
}: {
  projects: Resume["projects"];
}) {
  if (projects.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">🚀 项目作品</h2>
      <div className="grid gap-4">
        {projects.map((project) => (
          <a
            key={project.url}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 border border-[var(--color-border)]
              hover:border-blue-500 transition-colors"
            style={{ borderRadius: "8px" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    {project.description}
                  </p>
                )}
              </div>
              {project.stars !== undefined && (
                <span className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] flex-shrink-0">
                  ⭐ {project.stars}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

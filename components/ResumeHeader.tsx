import type { Resume } from "@/lib/schema";

export function ResumeHeader({ resume }: { resume: Resume }) {
  return (
    <header className="pb-8 border-b border-[var(--color-border)]">
      <div>
        <h1 className="text-3xl font-bold mb-1">{resume.name}</h1>
        <p className="text-xl text-[var(--color-text-secondary)] mb-3">
          {resume.title}
        </p>
        {resume.location && (
          <p className="text-sm text-[var(--color-text-secondary)] mb-2">
            📍 {resume.location}
          </p>
        )}

        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          {resume.email && (
            <a
              href={`mailto:${resume.email}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ✉️ {resume.email}
            </a>
          )}
          {resume.github && (
            <a
              href={`https://${resume.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              🐙 {resume.github}
            </a>
          )}
          {resume.blog && (
            <a
              href={`https://${resume.blog}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              🌐 {resume.blog}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

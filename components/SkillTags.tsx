import type { Resume } from "@/lib/schema";

export function SkillTags({ skills }: { skills: Resume["skills"] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">🛠 技能</h2>
      {skills.map((group) => (
        <div key={group.name} className="mb-4">
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            {group.name}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {group.items.map((item) => (
              <span
                key={item}
                className="px-2.5 py-1 text-xs rounded-full
                  bg-gray-100 dark:bg-gray-800
                  text-[var(--color-text-secondary)]
                  border border-[var(--color-border)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

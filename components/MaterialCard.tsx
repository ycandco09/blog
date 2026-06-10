import type { Material } from "@/lib/schema";
import { categories } from "@/config/categories";
import { formatDate } from "@/lib/utils";

export function MaterialCard({
  material,
}: {
  material: Material & { slug: string };
}) {
  const config = categories[material.category];

  return (
    <a
      href={material.file_path}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 border border-[var(--color-border)]
        hover:translate-y-[-2px] transition-transform duration-200
        bg-[var(--color-bg-card)]"
      style={{ borderRadius: "8px" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {config && (
              <span
                className="px-2 py-0.5 text-xs rounded-full text-white"
                style={{ backgroundColor: config.color }}
              >
                {config.icon} {config.description}
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-1">{material.title}</h3>
          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
            {material.description}
          </p>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span className="text-xs text-[var(--color-text-secondary)]">
            {material.size}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-[var(--color-text-secondary)]">
        <time dateTime={material.date}>{formatDate(material.date)}</time>
        {material.tags.length > 0 && (
          <span>{material.tags.map((t) => `#${t}`).join(" ")}</span>
        )}
      </div>
    </a>
  );
}

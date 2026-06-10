import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/breadcrumb";

export function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="面包屑导航" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] flex-wrap">
        {items.map((item, index) => (
          <li key={item.url} className="flex items-center gap-2">
            {index > 0 && <span>/</span>}
            {index < items.length - 1 ? (
              <Link
                href={item.url}
                className="hover:text-blue-600 transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-[var(--color-text)] font-medium">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

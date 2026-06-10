import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath = "/blog",
}: PaginationProps) {
  return (
    <nav className="flex justify-center gap-2 mt-8" aria-label="分页导航">
      {currentPage > 1 && (
        <Link
          href={`${basePath}?page=${currentPage - 1}`}
          className="px-4 py-2 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-bg-card)] transition-colors"
        >
          上一页
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={`${basePath}?page=${page}`}
          className={`px-4 py-2 rounded-md border transition-colors ${
            page === currentPage
              ? "bg-blue-600 text-white border-blue-600"
              : "border-[var(--color-border)] hover:bg-[var(--color-bg-card)]"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="px-4 py-2 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-bg-card)] transition-colors"
        >
          下一页
        </Link>
      )}
    </nav>
  );
}

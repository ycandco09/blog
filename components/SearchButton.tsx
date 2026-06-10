import Link from "next/link";

export function SearchButton() {
  return (
    <Link
      href="/search"
      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg
        border border-[var(--color-border)]
        text-[var(--color-text-secondary)]
        hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
      aria-label="打开搜索"
    >
      <span>🔍</span>
      <span className="hidden sm:inline">搜索</span>
      <kbd
        className="hidden md:inline text-xs px-1.5 py-0.5 rounded
        bg-gray-100 dark:bg-gray-800"
      >
        Ctrl+K
      </kbd>
    </Link>
  );
}

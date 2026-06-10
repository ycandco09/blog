import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { SearchButton } from "./SearchButton";
import { MobileMenu } from "./MobileMenu";

const navLinks = [
  { href: "/blog", label: "博客" },
  { href: "/materials", label: "资料库" },
  { href: "/writeups", label: "Writeups" },
  { href: "/resume", label: "简历" },
  { href: "/about", label: "关于" },
];

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--color-border)]
      bg-[var(--color-bg)]/80 backdrop-blur-md"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-16">
        <Link href="/" className="text-xl font-bold tracking-tight">
          🔐 Security Blog
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="主导航">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--color-text-secondary)]
                hover:text-[var(--color-text)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SearchButton />
          <ThemeToggle />
          <MobileMenu links={navLinks} />
        </div>
      </div>
    </header>
  );
}

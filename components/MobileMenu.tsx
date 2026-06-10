"use client";

import { useState } from "react";
import Link from "next/link";

interface MobileMenuProps {
  links: { href: string; label: string }[];
}

export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md border border-gray-200 dark:border-gray-800
          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="菜单"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <nav className="absolute top-16 left-0 right-0
          bg-white dark:bg-[#0a0c10] border-b border-[var(--color-border)] p-4"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm text-[var(--color-text-secondary)]
                hover:text-[var(--color-text)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

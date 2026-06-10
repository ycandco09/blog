export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-[var(--color-text-secondary)]">
        <p>Built with Next.js · Powered by Markdown · Deployed on Vercel</p>
        <p className="mt-1">
          &copy; {new Date().getFullYear()} Security Blog. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

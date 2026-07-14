import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-2">
        <p>&copy; {new Date().getFullYear()} MarketFlip AI. Estimates only — not financial advice.</p>
        <div className="flex items-center gap-6">
          <Link href="/search" className="hover:text-foreground transition-colors">Search</Link>
          <Link href="/reseller" className="hover:text-foreground transition-colors">Reseller</Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}

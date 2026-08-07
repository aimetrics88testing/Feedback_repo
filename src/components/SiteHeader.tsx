"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const onAdmin = pathname.startsWith("/admin");

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          Campus<span>Voice</span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <Link
            href="/submit"
            className={pathname === "/submit" ? "is-active" : undefined}
          >
            Share feedback
          </Link>
          <Link
            href="/admin"
            className={onAdmin ? "is-active" : undefined}
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

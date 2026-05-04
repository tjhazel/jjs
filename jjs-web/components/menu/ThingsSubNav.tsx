"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ThingsSubNav() {
  const pathname = usePathname();

  // Only show nav if we're on a sub-page (not /things)
  if (pathname === "/things" || pathname === "/things/") {
    return null;
  }

  const navItems = [
    { label: "Wordle Hints", href: "/things/wordle" },
    { label: "Back to Things", href: "/things" },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex gap-2 border-b border-gray-100 bg-background px-4 py-3 items-center">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            isActive(item.href)
              ? "text-foreground border-b-2 border-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

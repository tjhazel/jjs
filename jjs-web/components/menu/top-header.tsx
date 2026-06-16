'use client';

import React, { JSX, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
}

export default function TopHeader(): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
   const pathname = usePathname?.() || '/';

  const nav: NavItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Album', href: '/album' },
    { name: 'Recipe', href: '/recipe' },
    { name: 'Things', href: '/things' },
    { name: 'Admin', href: '/admin' },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black flex items-center justify-center text-white text-xs font-bold">JJ</div>
              <span className="hidden sm:inline text-sm font-semibold text-gray-900">John & Jeri</span>
            </Link>
          </div>

          {/* Center: links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${
                    isActive ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: mobile button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            aria-expanded={open}
            aria-label="Toggle navigation"
            onClick={() => setOpen((s) => !s)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActive ? 'text-gray-900 bg-gray-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

'use client';

import React, { JSX, useState } from 'react';
import Link from 'next/link';
// import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
}

export default function TopHeader(): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
   const pathname = '/'; // usePathname?.() || '/';

  const nav: NavItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Album', href: '/album' },
    { name: 'Recipe', href: '/recipe' },
    { name: 'Things', href: '/things' },
    { name: 'Admin', href: '/admin' },
  ];

  return (
    <header className="w-full bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: brand */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-semibold">JH</div>
              <span className="hidden sm:inline font-medium">John, Jeri, and Sidney</span>
            </Link>
          </div>

          {/* Center: links (desktop) */}
          <nav className="hidden md:flex items-center gap-2">
            {nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 ${
                    isActive ? 'bg-sky-100 text-sky-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: actions + mobile button */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login" className="text-sm px-3 py-1.5 rounded-md hover:bg-gray-50">Log in</Link>
              <Link href="/signup" className="text-sm px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700">Sign up</Link>
            </div>

            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
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
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-4 pt-4 pb-6 space-y-1">
            {nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive ? 'bg-sky-100 text-sky-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}

            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" className="block text-center px-3 py-2 rounded-md">Log in</Link>
              <Link href="/signup" className="block text-center px-3 py-2 rounded-md bg-sky-600 text-white">Sign up</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

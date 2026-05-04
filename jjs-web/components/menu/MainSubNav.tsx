"use client";

import { useCategories } from "@/api/post/category-fetcher";
import { useApiContext } from "@/components/context/ApiContext";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function MainSubNav() {
  const { httpGet } = useApiContext();
  const { data: categories, isLoading, error } = useCategories(httpGet);
  const [showOverflow, setShowOverflow] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const navRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateVisibleItems = () => {
      if (!navRef.current || !containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const navItems = navRef.current.querySelectorAll(".nav-item");
      const overflowButton = containerRef.current.querySelector(".overflow-button");
      
      let availableWidth = containerWidth - (overflowButton?.getBoundingClientRect().width || 40);
      let visible = 0;

      navItems.forEach((item) => {
        const itemWidth = (item as HTMLElement).offsetWidth;
        if (availableWidth > itemWidth) {
          availableWidth -= itemWidth;
          visible++;
        }
      });

      setVisibleCount(Math.max(1, visible));
    };

    calculateVisibleItems();
    window.addEventListener("resize", calculateVisibleItems);
    return () => window.removeEventListener("resize", calculateVisibleItems);
  }, [categories]);

  if (isLoading) return <div className="text-sm text-muted-foreground p-4">Loading categories...</div>;
  if (error) return <div className="text-sm text-destructive p-4">Error loading categories</div>;

  const allItems = [
    { id: "all", label: "All Categories", href: "/article/category/6", section: "categories" },
    ...(categories?.map((cat) => ({
      id: cat.categoryId.toString(),
      label: cat.title,
      href: `/article/category/${cat.categoryId}`,
      section: "categories",
    })) || []),
  ];

  const visibleItems = allItems.slice(0, visibleCount);
  const overflowItems = allItems.slice(visibleCount);

  return (
    <div ref={containerRef} className="flex gap-2 border-b border-gray-100 bg-background px-4 py-3 items-center w-3/4">
      <nav ref={navRef} className="flex gap-2 flex-1">
        {visibleItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="nav-item px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {overflowItems.length > 0 && (
        <div className="relative overflow-button">
          <button
            onClick={() => setShowOverflow(!showOverflow)}
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ...
          </button>
          {showOverflow && (
            <div className="absolute right-0 top-full mt-1 bg-background border border-gray-200 rounded shadow-lg z-50">
              {overflowItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 whitespace-nowrap"
                  onClick={() => setShowOverflow(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

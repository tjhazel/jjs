import { useEffect, useRef, useState } from 'react';

interface Props<T> {
  items: T[];
  pageSize?: number;
  resetKey?: unknown;
  endMessage?: React.ReactNode;
  children: (visibleItems: T[]) => React.ReactNode;
}

function InfiniteScroll<T>({ items, pageSize = 9, resetKey, endMessage, children }: Props<T>) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [resetKey, pageSize]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting)
        setVisibleCount(c => Math.min(c + pageSize, items.length));
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [items.length, pageSize]);

  return (
    <>
      {children(items.slice(0, visibleCount))}
      <div ref={sentinelRef} />
      {visibleCount >= items.length && items.length > 0 && endMessage}
    </>
  );
}

export default InfiniteScroll;

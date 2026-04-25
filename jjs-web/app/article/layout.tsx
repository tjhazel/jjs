"use client" 

import { User } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import CategorySelector from "@/components/article/CategorySelector";
import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const router = useRouter();
     const [category, setCategory] = useState<number | null>();
   
const changeCategory = (id: number | null) => {
  console.log("Selected category ID:", id);
  setCategory(id || null);
  if (id) router.push('/article/category/' + id);
}

  return (
     <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex justify-between items-center p-4">
          <CategorySelector selectedCategory={category ?? null} onCategoryChange={(id) => changeCategory(id)} />
          <div>Right aligned content</div>
        </div>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <User />
          </header>
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
            {children}
          </main>
        </div>
        <Analytics />
      </main>
  );
}

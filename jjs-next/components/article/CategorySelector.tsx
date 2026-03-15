"use client";

import { useCategories } from "@/api/post/category-fetcher";
import { useApiContext } from "@/components/context/ApiContext";

interface CategorySelectorProps {
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export default function CategorySelector({ selectedCategory, onCategoryChange }: CategorySelectorProps) {
  const { httpGet } = useApiContext();
  const { data: categories, isLoading, error } = useCategories(httpGet);

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error loading categories</div>;

  return (
    <select
      value={selectedCategory || ""}
      onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
      className="border rounded p-2"
    >
      <option value="">All Categories</option>
      {categories?.map((category) => (
        <option key={category.categoryId} value={category.categoryId}>
          {category.title}
        </option>
      ))}
    </select>
  );
}
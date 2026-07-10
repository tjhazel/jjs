import { Select } from "@mantine/core";
import { useCategories } from "@/api/post/category-fetcher";
import { useApiContext } from "@api/ApiContext";
import { useAuth } from "@lib/auth/authContext";

const FACETUBE_CATEGORY_ID = 8;

interface CategorySelectorProps {
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export default function CategorySelector({ selectedCategory, onCategoryChange }: CategorySelectorProps) {
  const { httpGet } = useApiContext();
  const { data: categories, isLoading } = useCategories(httpGet);
  const { isAuthenticated } = useAuth();

  const visibleCategories = isAuthenticated
    ? categories
    : categories?.filter(c => c.categoryId !== FACETUBE_CATEGORY_ID);

  const options = [
    { value: "", label: "All Categories" },
    ...(visibleCategories?.map((c) => ({ value: String(c.categoryId), label: c.title })) ?? []),
  ];

  return (
    <Select
      size="sm"
      data={options}
      value={selectedCategory != null ? String(selectedCategory) : ""}
      onChange={(v) => onCategoryChange(v ? Number(v) : null)}
      disabled={isLoading}
      comboboxProps={{ withinPortal: false }}
    />
  );
}

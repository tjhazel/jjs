import { Select } from "@mantine/core";
import { useCategories } from "@/api/post/category-fetcher";
import { useApiContext } from "@api/ApiContext";

interface CategorySelectorProps {
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export default function CategorySelector({ selectedCategory, onCategoryChange }: CategorySelectorProps) {
  const { httpGet } = useApiContext();
  const { data: categories, isLoading } = useCategories(httpGet);

  const options = [
    { value: "", label: "All Categories" },
    ...(categories?.map((c) => ({ value: String(c.categoryId), label: c.title })) ?? []),
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
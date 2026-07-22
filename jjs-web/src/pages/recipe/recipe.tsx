import { Title, Text, Stack, Image } from '@mantine/core';
import { useRecipe } from '@api/recipe/recipe-fetcher'; // Adjusted alias mapping for Vite src layouts
import { useApiContext } from '@api/ApiContext';
import RecipeTable from '@components/recipe/RecipeTable';

export default function RecipePage() {
  const { httpGet } = useApiContext();
  const { data: recipes, isLoading } = useRecipe(httpGet);

  return (
    <Stack gap="xl">
        
        {/* Page Typography Header */}
        <Stack gap={4}>
          <Title order={1} size="h1" fw={600} lh="sm">
            Recipes
          </Title>
          <Text size="sm" c="dimmed">
            Browse and explore our collection of recipes
          </Text>
        </Stack>

        {/* Cleaned Refactored Mantine Recipe Grid */}
        <RecipeTable recipes={recipes} isLoading={isLoading} />

        {/* Scaled Responsive Graphical Footer Strip */}
        <Image
          src="/Images/recipeFooter.jpg"
          alt="Recipe Footer decoration"
          h={70}
          w="100%"
          fit="cover"
          mt="xl"
          radius="none"
          fallbackSrc="https://placehold.co" // Graceful image error fallback loading track
        />

    </Stack>
  );
}

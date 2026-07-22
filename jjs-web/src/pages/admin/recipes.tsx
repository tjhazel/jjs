import { useNavigate } from 'react-router';
import { Stack, Group, Title, Button, Alert, Text } from '@mantine/core';
import { IconPlus, IconAlertCircle } from '@tabler/icons-react';
import { useRecipe } from '@api/recipe/recipe-fetcher';
import { useApiContext } from '@api/ApiContext';
import ManageRecipes from '@components/recipe/edit/ManageRecipies';

export default function ManageRecipesPage() {
  const navigate = useNavigate();
  const { httpGet } = useApiContext();
  const { data: recipes, error, isLoading } = useRecipe(httpGet);

  return (
    <Stack gap="sm">
        {/* Responsive Dashboard Control Banner Header */}
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Title order={1} size="h2" fw={600} lh="sm">
              Recipes
            </Title>
            <Text size="xs" c="dimmed">
              Draft, customize parameters, ingredients, and adjust site view visibility settings.
            </Text>
          </Stack>

          <Button
            variant="default"
            radius="none"
            size="sm"
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate("/admin/recipe/new")}
          >
            New Recipe
          </Button>
        </Group>

        {/* Fetching Exception Intercept Trace Alert */}
        {error && (
          <Alert 
            variant="light" 
            color="red" 
            title="Database Connection Issue" 
            icon={<IconAlertCircle size={16} />}
            radius="none"
          >
            {typeof error === 'string' ? error : 'Failed to synchronize with backend records cache details.'}
          </Alert>
        )}

        {/* Functional Tabular Element Core Frame */}
        <ManageRecipes recipes={recipes} isLoading={isLoading} />

    </Stack>
  );
}

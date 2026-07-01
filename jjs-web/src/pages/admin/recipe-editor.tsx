import { useState } from 'react';
import { useNavigate, useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { Container, Stack, Title, Text, Button, Alert, Group, Center, Loader } from '@mantine/core';
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { useSingleRecipe, saveRecipe } from '@api/recipe/recipe-fetcher';
import { useApiContext } from '@api/ApiContext';
import type { RecipeDetail } from '@api/recipe/recipe';
import RecipeEditor from '@components/recipe/edit/RecipeEditor';

// 🟢 1. ROUTER LOADER INTERCEPTOR
export const editRecipeLoader = async ({ params }: LoaderFunctionArgs) => {
  const idParam = params.id;
  if (!idParam) throw new Response("Missing Target Identifier", { status: 400 });

  if (idParam === 'new') {
    return { id: null, isNew: true };
  }

  const parsedId = parseInt(idParam, 10);
  if (isNaN(parsedId)) throw new Response("Invalid Identification Format", { status: 400 });

  return { id: parsedId, isNew: false };
};

// 🟢 2. ROUTE WRAPPER VIEW PAGE
export default function EditRecipePage() {
  const navigate = useNavigate();
  const { httpGet, httpPost } = useApiContext();

  const { id, isNew } = useLoaderData() as { id: number | null; isNew: boolean };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: recipe, isLoading, error } = useSingleRecipe(httpGet, isNew ? null : id);

  const handleSave = async (formData: RecipeDetail) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      if (isNew) {
        console.log('Posting new recipe payload:', formData);
      } else {
        console.log(`Putting updates for recipe ID ${id}:`, formData);
       }
      await saveRecipe(httpPost, formData)
      navigate('/admin/recipes');
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to submit modifications.');
    } finally {
      setIsSaving(false);
    }
  };

  const showLoading = !isNew && isLoading;
  const recipeNotFound = !isNew && !isLoading && !recipe;

   if (showLoading) {
      return (
         <Center py="xl">
            <Group gap="sm">
               <Loader size="sm" type="dots" />
               <Text c="dimmed">Loading recipes...</Text>
            </Group>
         </Center>
      );
   }

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        <Stack gap={4}>
          <Group>
            <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/admin/recipe')} styles={{ root: { paddingLeft: 0 } }}>
              Back to Recipes
            </Button>
          </Group>
          <Title order={1} size="h2" fw={600} lh="sm" c="dark.9">
            {isNew ? 'Create New Recipe' : 'Edit Recipe'}
          </Title>
          <Text size="xs" c="dimmed">
            {isNew ? 'Configure metrics and attributes to save a clean recipe record.' : `Modifying parameters for Recipe reference #${id}`}
          </Text>
        </Stack>

        {(error || saveError || recipeNotFound) && (
          <Alert variant="light" color="red" title="Administrative Error Trace" icon={<IconAlertCircle size={16} />} radius="none">
            {recipeNotFound && "The targeted recipe item detail context was missing from your collection entries."}
            {saveError && saveError}
            {error && "Could not link administrative tables with your web storage endpoints."}
          </Alert>
        )}

        {!recipeNotFound && (
          <RecipeEditor recipe={recipe} isSaving={isSaving} onSave={handleSave} onCancel={() => navigate('/admin/recipe')} />
        )}
      </Stack>
    </Container>
  );
}

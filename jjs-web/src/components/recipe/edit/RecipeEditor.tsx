import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { 
  TextInput, Textarea, Card, Title, Text, Stack, 
  SimpleGrid, Grid, Switch, Group, Button, Box, NumberInput 
} from '@mantine/core';
import { recipeSchema } from '@api/recipe/recipeSchema';
import type { RecipeDetail } from '@api/recipe/recipe';
import { formatDate } from '@lib/time.functions';

interface RecipeEditorProps {
  recipe?: RecipeDetail;
  isSaving?: boolean;
  onSave: (data: any) => void;
  onCancel?: () => void;
}

const DEFAULT_RECIPE = {
  name: "", description: "", recipeSource: "", course: "", dishType: "",
  calories: 0, fat: 0, numberServed: 2, prepTime: "", cookTime: "",
  estimatedCost: 0.00, isViewableByPublic: false, recipeCategoryIds: [],
};

export default function RecipeEditor({ recipe, isSaving = false, onSave, onCancel }: RecipeEditorProps) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: DEFAULT_RECIPE,
    validate: zodResolver(recipeSchema),
  });

  useEffect(() => {
    if (recipe) {
      form.initialize({
        name: recipe.name || "",
        description: recipe.description || "",
        recipeSource: recipe.recipeSource || "",
        course: recipe.course || "",
        dishType: recipe.dishType || "",
        calories: recipe.calories || 0,
        fat: recipe.fat || 0,
        numberServed: recipe.numberServed || 2,
        prepTime: recipe.prepTime || "",
        cookTime: recipe.cookTime || "",
        estimatedCost: recipe.estimatedCost || 0,
        isViewableByPublic: recipe.isViewableByPublic || false,
        recipeCategoryIds: recipe.recipeCategoryIds || [],
      });
    }
  }, [recipe]);

  const isNew = !recipe?.recipeId;

  return (
    <Box component="form" onSubmit={form.onSubmit((values) => onSave(values))} noValidate>
      <Stack gap="xl">
        {/* Core Info */}
        <Card withBorder padding="xl" radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600} c="dark.9">Core Content</Title>
            <TextInput withAsterisk label="Recipe Name" radius="none" key={form.key('name')} {...form.getInputProps('name')} />
            <Textarea withAsterisk label="Description" rows={4} radius="none" key={form.key('description')} {...form.getInputProps('description')} />
            <TextInput label="Source / Reference" radius="none" key={form.key('recipeSource')} {...form.getInputProps('recipeSource')} />
          </Stack>
        </Card>

        {/* Categories & Classifications */}
        <Card withBorder padding="xl" radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600} c="dark.9">Classifications</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput withAsterisk label="Course" placeholder="e.g. Dinner" radius="none" key={form.key('course')} {...form.getInputProps('course')} />
              <TextInput withAsterisk label="Dish Type" placeholder="e.g. Pasta" radius="none" key={form.key('dishType')} {...form.getInputProps('dishType')} />
            </SimpleGrid>
          </Stack>
        </Card>

        {/* Metrics Grid */}
        <Card withBorder padding="xl" radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600} c="dark.9">Cooking Metrics & Cost</Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              <NumberInput label="Servings" min={1} radius="none" key={form.key('numberServed')} {...form.getInputProps('numberServed')} />
              <TextInput label="Prep Time" placeholder="e.g. 15 mins" radius="none" key={form.key('prepTime')} {...form.getInputProps('prepTime')} />
              <TextInput label="Cook Time" placeholder="e.g. 30 mins" radius="none" key={form.key('cookTime')} {...form.getInputProps('cookTime')} />
              <NumberInput label="Calories" min={0} radius="none" key={form.key('calories')} {...form.getInputProps('calories')} />
              <NumberInput label="Fat (grams)" min={0} radius="none" key={form.key('fat')} {...form.getInputProps('fat')} />
              <NumberInput label="Estimated Cost ($)" min={0} decimalScale={2} fixedDecimalScale radius="none" key={form.key('estimatedCost')} {...form.getInputProps('estimatedCost')} />
            </SimpleGrid>
          </Stack>
        </Card>

        {/* Global Settings */}
        <Card withBorder padding="xl" radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600} c="dark.9">Visibility Settings</Title>
            <Switch
              labelPosition="left"
              label={
                <Box>
                  <Text size="sm" fw={500}>Visible by Public</Text>
                  <Text size="xs" c="dimmed">Allow anonymous web visitors to view this recipe card listing</Text>
                </Box>
              }
              key={form.key('isViewableByPublic')}
              {...form.getInputProps('isViewableByPublic', { type: 'checkbox' })}
            />
          </Stack>
        </Card>

        {/* Audit Log Panel */}
        {!isNew && (
          <Card withBorder padding="xl" radius="none" bg="var(--mantine-color-gray-0)">
            <Stack gap="md">
              <Title order={2} size="h4" fw={600} c="dark.9">Audit Overview</Title>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Created By</Text>
                  <Text size="sm" fw={500}>{recipe?.createdBy}</Text>
                  <Text size="xs" c="dimmed">{recipe?.createdDate ? formatDate(recipe.createdDate) : "—"}</Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Last Modified</Text>
                  <Text size="sm" fw={500}>{recipe?.modifiedBy}</Text>
                  <Text size="xs" c="dimmed">{recipe?.modifiedDate ? formatDate(recipe.modifiedDate) : "—"}</Text>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>
        )}

        {/* Submit Blocks */}
        <Group justify="space-between" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
          <Group gap="md">
            <Button type="submit" color="dark" radius="none" loading={isSaving} disabled={!form.isDirty()}>
              {isNew ? 'Create Recipe' : 'Save Changes'}
            </Button>
            {onCancel && (
              <Button type="button" variant="subtle" color="gray" radius="none" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </Group>
          {!isNew && <Text fontFamily="monospace" size="xs" c="dimmed">ID: {recipe?.recipeId}</Text>}
        </Group>
      </Stack>
    </Box>
  );
}
